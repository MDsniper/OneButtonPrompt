#!/usr/bin/env python3
from flask import Flask, render_template_string, request, jsonify
from flask_cors import CORS
import random
import os
from model_generators import model_registry

app = Flask(__name__)

# Configure CORS for production
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, origins=CORS_ORIGINS)

# Enhanced prompt generation function with model support
def generate_model_prompt(model_type="sdxl", subject_type="random", artist_style="random", image_type="random", insanity=5, manual_subject="", prefix="", suffix="", **kwargs):
    """Generate prompt using specified model's optimized generator"""
    try:
        return model_registry.generate_prompt(
            model_type=model_type,
            subject_type=subject_type,
            artist_style=artist_style,
            image_type=image_type,
            insanity=insanity,
            manual_subject=manual_subject,
            prefix=prefix,
            suffix=suffix,
            **kwargs
        )
    except Exception as e:
        # Fallback to simple generation if model fails
        return generate_simple_prompt(subject_type, artist_style, image_type, insanity, manual_subject, prefix, suffix)

# Legacy simple prompt generation function for backward compatibility
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
    
    return {
        "prompt": ", ".join(prompt_parts),
        "negative_prompt": "low quality, blurry, pixelated, jpeg artifacts, bad anatomy, deformed, mutated, extra limbs, missing limbs, watermark, signature, text, cropped, out of frame, oversaturated, undersaturated, overexposed, underexposed",
        "model_type": "legacy"
    }

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'}), 200

@app.route('/models', methods=['GET'])
def get_models():
    """Get list of available AI models with their configurations"""
    try:
        models = model_registry.get_all_models()
        model_dict = {}
        for key, config in models.items():
            model_dict[key] = {
                'display_name': config.display_name,
                'description': config.description,
                'optimal_prompt_style': config.optimal_prompt_style,
                'supports_negative_prompts': config.supports_negative_prompts,
                'supports_weights': config.supports_weights,
                'recommended_settings': config.recommended_settings
            }
        return jsonify(model_dict), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/models/<model_type>/settings', methods=['GET'])
def get_model_settings(model_type):
    """Get recommended settings for a specific model"""
    try:
        model = model_registry.get_model(model_type)
        if not model:
            return jsonify({'error': f'Model {model_type} not found'}), 404
        config = model['config']
        return jsonify({
            'model_type': model_type,
            'recommended_settings': config.recommended_settings,
            'supports_negative_prompts': config.supports_negative_prompts,
            'supports_weights': config.supports_weights
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate', methods=['POST', 'OPTIONS'])
def generate():
    if request.method == 'OPTIONS':
        # Handle preflight request
        return '', 204
    
    try:
        data = request.json
        model_type = data.get('model_type', 'sdxl')
        
        # Generate prompt using model-specific generator
        result = generate_model_prompt(
            model_type=model_type,
            subject_type=data.get('subject_type', 'random'),
            artist_style=data.get('artist_style', 'random'),
            image_type=data.get('image_type', 'random'),
            insanity=int(data.get('insanity', 5)),
            manual_subject=data.get('manual_subject', ''),
            prefix=data.get('prefix', ''),
            suffix=data.get('suffix', '')
        )
        
        # Ensure result is a dict for JSON response
        if isinstance(result, str):
            result = {'prompt': result, 'negative_prompt': '', 'model_type': 'legacy'}
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate/batch', methods=['POST', 'OPTIONS'])
def generate_batch():
    """Generate prompts for all models"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        
        # Generate for all available models
        results = model_registry.generate_all_prompts(
            subject_type=data.get('subject_type', 'random'),
            artist_style=data.get('artist_style', 'random'),
            image_type=data.get('image_type', 'random'),
            insanity=int(data.get('insanity', 5)),
            manual_subject=data.get('manual_subject', ''),
            prefix=data.get('prefix', ''),
            suffix=data.get('suffix', '')
        )
        
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Production server would use gunicorn or uwsgi
    # This is just for local testing
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)