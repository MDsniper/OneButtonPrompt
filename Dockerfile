FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy application files
COPY . /app/

# Install Python dependencies
RUN pip install --no-cache-dir \
    flask \
    flask-cors \
    requests \
    pillow \
    numpy

# Install PyTorch CPU version and ML dependencies
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir transformers sentencepiece

# Create necessary directories
RUN mkdir -p /app/automated_outputs/txt2img \
    /app/automated_outputs/img2img \
    /app/automated_outputs/prompts \
    /app/automated_outputs/extras \
    /app/automated_outputs/upscale_me

# Create a simple web server wrapper
RUN cat > /app/web_server.py << 'EOF'
from flask import Flask, render_template_string, request, jsonify
from flask_cors import CORS
import sys
import os
import json
from build_dynamic_prompt import *

app = Flask(__name__)
CORS(app)

HTML_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>One Button Prompt Generator</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #333;
            text-align: center;
            font-size: 2.5em;
            margin-bottom: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 40px;
            font-size: 18px;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }
        button:active {
            transform: translateY(0);
        }
        .settings {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .setting-group {
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            color: #555;
            font-weight: 600;
        }
        select, input {
            width: 100%;
            padding: 8px;
            border: 2px solid #e0e0e0;
            border-radius: 5px;
            font-size: 14px;
        }
        .prompt-output {
            margin-top: 30px;
            padding: 25px;
            background: #f8f9fa;
            border-radius: 10px;
            min-height: 100px;
        }
        .prompt-label {
            font-weight: 600;
            color: #555;
            margin-bottom: 10px;
        }
        .prompt-text {
            padding: 15px;
            background: white;
            border-radius: 5px;
            border: 2px solid #e0e0e0;
            min-height: 60px;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: monospace;
            font-size: 14px;
            line-height: 1.5;
        }
        .copy-button {
            margin-top: 10px;
            padding: 8px 20px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        }
        .copy-button:hover {
            background: #218838;
        }
        .loading {
            display: none;
            text-align: center;
            margin: 20px;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 One Button Prompt Generator</h1>
        
        <div class="settings">
            <div class="setting-group">
                <label for="subject">Subject:</label>
                <select id="subject">
                    <option value="all">All (Random)</option>
                    <option value="object">Object</option>
                    <option value="animal">Animal</option>
                    <option value="humanoid">Humanoid</option>
                    <option value="landscape">Landscape</option>
                    <option value="concept">Concept</option>
                </select>
            </div>
            
            <div class="setting-group">
                <label for="artist">Artist Style:</label>
                <select id="artist">
                    <option value="all">All (Random)</option>
                    <option value="none">No Artist</option>
                    <option value="popular">Popular Artists</option>
                    <option value="greg rutkowski">Greg Rutkowski</option>
                    <option value="artgerm">Artgerm</option>
                </select>
            </div>
            
            <div class="setting-group">
                <label for="imagetype">Image Type:</label>
                <select id="imagetype">
                    <option value="all">All (Random)</option>
                    <option value="photograph">Photograph</option>
                    <option value="painting">Painting</option>
                    <option value="digital art">Digital Art</option>
                    <option value="3d render">3D Render</option>
                    <option value="drawing">Drawing</option>
                </select>
            </div>
            
            <div class="setting-group">
                <label for="insanity">Insanity Level:</label>
                <input type="range" id="insanity" min="0" max="10" value="5">
                <span id="insanityValue">5</span>
            </div>
        </div>
        
        <div class="settings">
            <div class="setting-group" style="grid-column: 1 / -1;">
                <label for="manual_subject">Manual Subject (Optional):</label>
                <input type="text" id="manual_subject" placeholder="e.g., 'a cyberpunk cat wearing sunglasses'" style="width: 100%;">
            </div>
            
            <div class="setting-group" style="grid-column: 1 / -1;">
                <label for="prefix">Prefix Prompt (Optional):</label>
                <input type="text" id="prefix" placeholder="Add text at the beginning of generated prompt" style="width: 100%;">
            </div>
            
            <div class="setting-group" style="grid-column: 1 / -1;">
                <label for="suffix">Suffix Prompt (Optional):</label>
                <input type="text" id="suffix" placeholder="Add text at the end of generated prompt" style="width: 100%;">
            </div>
        </div>
        
        <div class="button-container">
            <button onclick="generatePrompt()">🎲 Generate Prompt</button>
        </div>
        
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Generating amazing prompt...</p>
        </div>
        
        <div class="prompt-output" id="promptOutput" style="display:none;">
            <div class="prompt-label">Generated Prompt:</div>
            <div class="prompt-text" id="promptText"></div>
            <button class="copy-button" onclick="copyToClipboard()">📋 Copy to Clipboard</button>
            
            <div style="margin-top: 20px;">
                <div class="prompt-label">Negative Prompt:</div>
                <div class="prompt-text" id="negativeText"></div>
                <button class="copy-button" onclick="copyNegativeToClipboard()">📋 Copy Negative</button>
            </div>
        </div>
    </div>
    
    <script>
        document.getElementById('insanity').oninput = function() {
            document.getElementById('insanityValue').textContent = this.value;
        }
        
        async function generatePrompt() {
            const loading = document.getElementById('loading');
            const output = document.getElementById('promptOutput');
            
            loading.style.display = 'block';
            output.style.display = 'none';
            
            const settings = {
                subject: document.getElementById('subject').value,
                artist: document.getElementById('artist').value,
                imagetype: document.getElementById('imagetype').value,
                insanitylevel: document.getElementById('insanity').value,
                manual_subject: document.getElementById('manual_subject').value,
                prefix: document.getElementById('prefix').value,
                suffix: document.getElementById('suffix').value
            };
            
            try {
                const response = await fetch('/generate', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(settings)
                });
                
                const data = await response.json();
                
                document.getElementById('promptText').textContent = data.prompt;
                document.getElementById('negativeText').textContent = data.negative;
                
                loading.style.display = 'none';
                output.style.display = 'block';
            } catch (error) {
                alert('Error generating prompt: ' + error);
                loading.style.display = 'none';
            }
        }
        
        function copyToClipboard() {
            const text = document.getElementById('promptText').textContent;
            navigator.clipboard.writeText(text);
            alert('Prompt copied to clipboard!');
        }
        
        function copyNegativeToClipboard() {
            const text = document.getElementById('negativeText').textContent;
            navigator.clipboard.writeText(text);
            alert('Negative prompt copied to clipboard!');
        }
    </script>
</body>
</html>
'''

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.json
        
        # Get manual inputs
        manual_subject = data.get('manual_subject', '')
        prefix = data.get('prefix', '')
        suffix = data.get('suffix', '')
        
        # Generate prompt using the build_dynamic_prompt function
        prompt_result = build_dynamic_prompt(
            insanitylevel=int(data.get('insanitylevel', '5')),
            forcesubject=data.get('subject', 'all') if not manual_subject else 'all',
            artists=data.get('artist', 'all'),
            imagetype=data.get('imagetype', 'all'),
            givensubject=manual_subject,
            prefixprompt=prefix,
            suffixprompt=suffix,
            promptcompounderlevel="0",
            seperator="comma",
            smartsubject=True if not manual_subject else False,
            gender="all",
            imagemodechance=20,
            seed=-1,
            base_model="SD1.5",
            OBP_preset="",
            prompt_enhancer="none"
        )
        
        # Default negative prompt
        negative = "low quality, blurry, pixelated, noisy, oversaturated, undersaturated"
        
        return jsonify({
            'prompt': prompt_result,
            'negative': negative
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
EOF

# Expose port
EXPOSE 5000

# Copy enhanced backend with multi-model support
COPY backend-production.py /app/
COPY model_generators.py /app/

# Run the enhanced backend
CMD ["python", "backend-production.py"]