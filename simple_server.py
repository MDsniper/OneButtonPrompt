#!/usr/bin/env python3
from flask import Flask, render_template_string, request, jsonify
from flask_cors import CORS
import random
import sys
import os

# Add current directory to path to import model_generators
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from model_generators import ModelRegistry
    MULTI_MODEL_SUPPORT = True
    model_registry = ModelRegistry()
except ImportError:
    MULTI_MODEL_SUPPORT = False
    print("Warning: model_generators.py not found. Running in legacy mode.")

app = Flask(__name__)
CORS(app)

# Simple prompt generation function (legacy fallback)
def generate_simple_prompt(subject_type="random", artist_style="random", image_type="random", insanity=5, manual_subject="", prefix="", suffix=""):
    subjects = {
        "object": ["vintage camera", "crystal sphere", "mechanical clock", "ancient book", "steampunk goggles"],
        "animal": ["majestic eagle", "playful kitten", "mystical dragon", "wise owl", "elegant swan"],
        "humanoid": ["cyberpunk warrior", "fairy princess", "robot samurai", "viking berserker", "space explorer"],
        "landscape": ["misty mountains", "alien planet", "underwater city", "enchanted forest", "desert oasis"],
        "concept": ["time travel", "dreams within dreams", "digital consciousness", "parallel universes", "quantum entanglement"]
    }
    
    artists = [
        "Greg Rutkowski", "Artgerm", "Alphonse Mucha", "Studio Ghibli", "James Gurney", "Frank Frazetta",
        "Beeple", "Peter Mohrbacher", "Ross Tran", "Makoto Shinkai", "Ilya Kuvshinov", "Lois van Baarle",
        "Sam Spratt", "Yoji Shinkawa", "Hayao Miyazaki", "Norman Rockwell", "Steve McCurry", "Banksy",
        "H.R. Giger", "Zdzisław Beksiński", "Wayne Barlowe", "Michael Whelan", "Bob Ross", "Thomas Kinkade",
        "Syd Mead", "Simon Stålenhag", "Katsuhiro Otomo", "Moebius", "Ralph McQuarrie", "Drew Struzan",
        "Boris Vallejo", "Julie Bell", "Luis Royo", "Victoria Francés", "Anne Stokes", "Nene Thomas",
        "Josephine Wall", "Thomas Cole", "Albert Bierstadt", "Caspar David Friedrich", "Ivan Aivazovsky",
        "William Turner", "Claude Monet", "Vincent van Gogh", "Pablo Picasso", "Salvador Dalí",
        "René Magritte", "M.C. Escher", "Remedios Varo", "Frida Kahlo", "Gustav Klimt", "Egon Schiele",
        "Yoshitaka Amano", "Akira Toriyama", "Kentaro Miura", "Junji Ito", "Kim Jung Gi", "Ashley Wood",
        "Craig Mullins", "Sparth", "Feng Zhu", "Jama Jurabaev", "Dylan Cole", "Maciej Kuciara"
    ]
    
    image_types = [
        "digital painting", "oil painting", "watercolor", "3D render", "photograph", "concept art",
        "matte painting", "splash art", "cover art", "hyperrealistic", "photorealistic", "surrealism",
        "impressionism", "expressionism", "abstract art", "pop art", "art nouveau", "art deco",
        "baroque", "renaissance", "gothic art", "romanticism", "neoclassical", "minimalist art",
        "maximalist art", "psychedelic art", "vaporwave", "cyberpunk art", "steampunk art", "dieselpunk art",
        "biopunk art", "solarpunk art", "fantasy art", "sci-fi art", "horror art", "dark fantasy",
        "high fantasy", "low poly", "pixel art", "vector art", "line art", "ink drawing", "charcoal drawing",
        "pencil sketch", "colored pencil", "pastel art", "acrylic painting", "gouache painting", "tempera",
        "fresco", "encaustic", "airbrush art", "spray paint", "street art", "graffiti", "stencil art",
        "woodcut", "linocut", "etching", "lithograph", "screen print", "risograph", "cyanotype",
        "polaroid", "film photography", "digital photography", "drone photography", "macro photography",
        "portrait photography", "landscape photography", "architectural photography", "fashion photography",
        "underwater photography", "astrophotography", "HDR photography", "long exposure", "double exposure",
        "tilt-shift photography", "infrared photography", "x-ray art", "thermal imaging", "medical illustration",
        "technical illustration", "botanical illustration", "scientific illustration", "infographic",
        "comic art", "manga art", "anime art", "cartoon", "caricature", "chibi art", "isometric art",
        "flat design", "material design", "glassmorphism", "neumorphism", "brutalist design", "bauhaus",
        "memphis design", "swiss design", "scandinavian design", "japanese minimalism", "wabi-sabi",
        "ukiyo-e", "sumi-e", "mandala art", "zentangle", "sacred geometry", "fractal art", "generative art",
        "glitch art", "databending", "ascii art", "voxel art", "low poly 3D", "high poly 3D", "sculpted",
        "clay render", "wireframe", "holographic", "iridescent", "metallic art", "neon art", "bioluminescent",
        "stained glass", "mosaic", "tapestry", "embroidery", "origami", "paper cut art", "collage",
        "mixed media", "assemblage art", "found object art", "land art", "installation art", "performance art"
    ]
    
    styles = ["highly detailed", "cinematic lighting", "dramatic", "ethereal", "photorealistic", "fantasy art"]
    
    # Build the prompt
    prompt_parts = []
    
    # Add prefix if provided
    if prefix:
        prompt_parts.append(prefix)
    
    # Choose or use manual subject
    if manual_subject:
        prompt_parts.append(manual_subject)
    else:
        if subject_type == "all" or subject_type == "random":
            category = random.choice(list(subjects.keys()))
        else:
            category = subject_type if subject_type in subjects else "object"
        prompt_parts.append(random.choice(subjects[category]))
    
    # Add random descriptors based on insanity level
    num_styles = min(insanity, len(styles))
    if num_styles > 0:
        selected_styles = random.sample(styles, random.randint(1, num_styles))
        prompt_parts.extend(selected_styles)
    
    # Add image type
    if image_type == "all" or image_type == "random":
        prompt_parts.append(random.choice(image_types))
    elif image_type in image_types:
        prompt_parts.append(image_type)
    
    # Add artist if requested
    if artist_style != "none":
        if artist_style == "all" or artist_style == "random":
            prompt_parts.append(f"by {random.choice(artists)}")
        elif artist_style in artists:
            prompt_parts.append(f"by {artist_style}")
    
    # Add quality tags
    prompt_parts.extend(["masterpiece", "best quality", "8k"])
    
    # Add suffix if provided
    if suffix:
        prompt_parts.append(suffix)
    
    return ", ".join(prompt_parts)

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
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 One Button Prompt Generator</h1>
        
        <div class="settings">
            <div class="setting-group">
                <label for="subject">Subject Type:</label>
                <select id="subject">
                    <option value="random">Random</option>
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
                    <option value="random">Random Artist</option>
                    <option value="none">No Artist</option>
                    <option value="Greg Rutkowski">Greg Rutkowski</option>
                    <option value="Artgerm">Artgerm</option>
                    <option value="Studio Ghibli">Studio Ghibli</option>
                </select>
            </div>
            
            <div class="setting-group">
                <label for="imagetype">Image Type:</label>
                <select id="imagetype">
                    <option value="random">Random</option>
                    <option value="digital painting">Digital Painting</option>
                    <option value="oil painting">Oil Painting</option>
                    <option value="3D render">3D Render</option>
                    <option value="photograph">Photograph</option>
                    <option value="concept art">Concept Art</option>
                </select>
            </div>
            
            <div class="setting-group">
                <label for="insanity">Complexity Level:</label>
                <input type="range" id="insanity" min="0" max="10" value="5">
                <span id="insanityValue">5</span>
            </div>
        </div>
        
        <div class="settings">
            <div class="setting-group" style="grid-column: 1 / -1;">
                <label for="manual_subject">Custom Subject (Optional):</label>
                <input type="text" id="manual_subject" placeholder="e.g., 'a cyberpunk cat wearing sunglasses'">
            </div>
            
            <div class="setting-group" style="grid-column: 1 / -1;">
                <label for="prefix">Prefix (Optional):</label>
                <input type="text" id="prefix" placeholder="Text to add at the beginning">
            </div>
            
            <div class="setting-group" style="grid-column: 1 / -1;">
                <label for="suffix">Suffix (Optional):</label>
                <input type="text" id="suffix" placeholder="Text to add at the end">
            </div>
        </div>
        
        <div class="button-container">
            <button onclick="generatePrompt()">🎲 Generate Prompt</button>
        </div>
        
        <div class="prompt-output" id="promptOutput" style="display:none;">
            <div style="font-weight: 600; margin-bottom: 10px;">Generated Prompt:</div>
            <div class="prompt-text" id="promptText"></div>
            <button class="copy-button" onclick="copyToClipboard()">📋 Copy to Clipboard</button>
            
            <div style="margin-top: 20px;">
                <div style="font-weight: 600; margin-bottom: 10px;">Negative Prompt:</div>
                <div class="prompt-text" id="negativeText">low quality, blurry, pixelated, noisy, oversaturated, undersaturated, bad anatomy, wrong proportions</div>
                <button class="copy-button" onclick="copyNegative()">📋 Copy Negative</button>
            </div>
        </div>
    </div>
    
    <script>
        document.getElementById('insanity').oninput = function() {
            document.getElementById('insanityValue').textContent = this.value;
        }
        
        async function generatePrompt() {
            const output = document.getElementById('promptOutput');
            
            const settings = {
                subject_type: document.getElementById('subject').value,
                artist_style: document.getElementById('artist').value,
                image_type: document.getElementById('imagetype').value,
                insanity: document.getElementById('insanity').value,
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
                output.style.display = 'block';
            } catch (error) {
                alert('Error generating prompt: ' + error);
            }
        }
        
        function copyToClipboard() {
            const text = document.getElementById('promptText').textContent;
            navigator.clipboard.writeText(text);
            alert('Prompt copied to clipboard!');
        }
        
        function copyNegative() {
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

@app.route('/models', methods=['GET'])
def get_models():
    """Get all available models"""
    if MULTI_MODEL_SUPPORT:
        models = model_registry.get_all_models()
        return jsonify({
            model_type: {
                'display_name': config.display_name,
                'description': config.description,
                'optimal_prompt_style': config.optimal_prompt_style,
                'supports_negative_prompts': config.supports_negative_prompts,
                'supports_weights': config.supports_weights,
                'recommended_settings': config.recommended_settings
            }
            for model_type, config in models.items()
        })
    else:
        return jsonify({
            'legacy': {
                'display_name': 'Legacy',
                'description': 'Original prompt generator',
                'optimal_prompt_style': 'Mixed style',
                'supports_negative_prompts': True,
                'supports_weights': False,
                'recommended_settings': {}
            }
        })

@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.json
        model_type = data.get('model_type', 'sdxl')  # Default to SDXL
        
        if MULTI_MODEL_SUPPORT and model_type != 'legacy':
            # Use multi-model system
            result = model_registry.generate_prompt(
                model_type=model_type,
                subject_type=data.get('subject_type', 'random'),
                artist_style=data.get('artist_style', 'random'),
                image_type=data.get('image_type', 'random'),
                insanity=int(data.get('insanity', 5)),
                manual_subject=data.get('manual_subject', ''),
                prefix=data.get('prefix', ''),
                suffix=data.get('suffix', '')
            )
            return jsonify(result)
        else:
            # Use legacy system
            prompt = generate_simple_prompt(
                subject_type=data.get('subject_type', 'random'),
                artist_style=data.get('artist_style', 'random'),
                image_type=data.get('image_type', 'random'),
                insanity=int(data.get('insanity', 5)),
                manual_subject=data.get('manual_subject', ''),
                prefix=data.get('prefix', ''),
                suffix=data.get('suffix', '')
            )
            return jsonify({
                'prompt': prompt,
                'negative_prompt': 'low quality, blurry, pixelated, noisy, oversaturated, undersaturated, bad anatomy, wrong proportions',
                'model': 'legacy'
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate/batch', methods=['POST'])
def generate_batch():
    """Generate prompts for all models"""
    if not MULTI_MODEL_SUPPORT:
        return jsonify({'error': 'Multi-model support not available'}), 501
    
    try:
        data = request.json
        results = model_registry.generate_all_prompts(
            subject_type=data.get('subject_type', 'random'),
            artist_style=data.get('artist_style', 'random'),
            image_type=data.get('image_type', 'random'),
            insanity=int(data.get('insanity', 5)),
            manual_subject=data.get('manual_subject', ''),
            prefix=data.get('prefix', ''),
            suffix=data.get('suffix', '')
        )
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)