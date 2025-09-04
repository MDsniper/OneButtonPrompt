#!/usr/bin/env python3
"""
Multi-Model Prompt Generator System
Supports: SDXL, Qwen, Flux
"""

import random
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

@dataclass
class ModelConfiguration:
    """Configuration for each AI model"""
    model_type: str
    display_name: str
    description: str
    optimal_prompt_style: str
    supports_negative_prompts: bool
    supports_weights: bool
    recommended_settings: Dict[str, Any]

class BaseModelGenerator(ABC):
    """Abstract base class for model-specific prompt generators"""
    
    def __init__(self):
        self.subjects = {
            "object": ["vintage camera", "crystal sphere", "mechanical clock", "ancient book", "steampunk goggles", "ornate mirror", "brass telescope"],
            "animal": ["majestic eagle", "playful kitten", "mystical dragon", "wise owl", "elegant swan", "fierce tiger", "graceful deer"],
            "humanoid": ["cyberpunk warrior", "fairy princess", "robot samurai", "viking berserker", "space explorer", "elven archer", "steampunk inventor"],
            "landscape": ["misty mountains", "alien planet", "underwater city", "enchanted forest", "desert oasis", "floating islands", "crystal cavern"],
            "concept": ["time travel", "dreams within dreams", "digital consciousness", "parallel universes", "quantum entanglement", "collective memory", "astral projection"]
        }
        
        self.artists = [
            "Greg Rutkowski", "Artgerm", "Alphonse Mucha", "Studio Ghibli", "James Gurney", "Frank Frazetta",
            "Beeple", "Peter Mohrbacher", "Ross Tran", "Makoto Shinkai", "Ilya Kuvshinov", "Lois van Baarle"
        ]
        
        self.image_types = [
            "digital painting", "oil painting", "watercolor", "3D render", "photograph", "concept art",
            "matte painting", "splash art", "cover art", "hyperrealistic", "photorealistic", "surrealism"
        ]
    
    @abstractmethod
    def generate_prompt(self, **kwargs) -> str:
        """Generate model-specific prompt"""
        pass
    
    @abstractmethod
    def generate_negative_prompt(self) -> str:
        """Generate model-specific negative prompt"""
        pass
    
    def get_random_subject(self, subject_type: str) -> str:
        """Get a random subject based on type"""
        if subject_type == "random" or subject_type == "all":
            category = random.choice(list(self.subjects.keys()))
        else:
            category = subject_type if subject_type in self.subjects else "object"
        return random.choice(self.subjects[category])

class SDXLGenerator(BaseModelGenerator):
    """SDXL-optimized prompt generator"""
    
    def generate_prompt(self, subject_type="random", artist_style="random", image_type="random", 
                       insanity=5, manual_subject="", prefix="", suffix="", **kwargs) -> str:
        
        prompt_parts = []
        
        # Add prefix
        if prefix:
            prompt_parts.append(prefix)
        
        # Add technical quality tags for SDXL
        if insanity >= 7:
            prompt_parts.append("detailed masterpiece artwork")
        
        # Subject
        if manual_subject:
            prompt_parts.append(manual_subject)
        else:
            prompt_parts.append(self.get_random_subject(subject_type))
        
        # SDXL-specific technical details
        technical_details = [
            "highly detailed", "sharp focus", "professional photography",
            "studio lighting", "trending on artstation", "8k resolution",
            "octane render", "unreal engine", "photorealistic", "ray tracing"
        ]
        
        # Add technical details based on insanity
        num_details = min(insanity // 2, len(technical_details))
        if num_details > 0:
            selected_details = random.sample(technical_details, num_details)
            prompt_parts.extend(selected_details)
        
        # Add camera settings for photographic styles
        if image_type in ["photograph", "portrait photography", "landscape photography"]:
            cameras = ["Canon EOS R5", "Nikon Z9", "Sony A7R IV", "Hasselblad X2D"]
            lenses = ["85mm lens", "24-70mm lens", "50mm f/1.4", "135mm f/2"]
            prompt_parts.append(f"shot on {random.choice(cameras)}")
            prompt_parts.append(random.choice(lenses))
        
        # Lighting for SDXL
        if insanity >= 5:
            lighting = ["cinematic lighting", "dramatic lighting", "soft lighting", "volumetric lighting", "rim lighting"]
            prompt_parts.append(random.choice(lighting))
        
        # Image type
        if image_type == "random":
            prompt_parts.append(random.choice(self.image_types))
        elif image_type != "none":
            prompt_parts.append(image_type)
        
        # Artist with weight syntax for SDXL
        if artist_style != "none":
            if artist_style == "random":
                artist = random.choice(self.artists)
            else:
                artist = artist_style
            # SDXL supports weight syntax
            weight = 1.0 + (insanity * 0.05)  # Weight increases with insanity
            prompt_parts.append(f"(by {artist}:{weight:.1f})")
        
        # Quality tags for SDXL
        prompt_parts.extend(["masterpiece", "best quality", "8k uhd"])
        
        # Add suffix
        if suffix:
            prompt_parts.append(suffix)
        
        return ", ".join(prompt_parts)
    
    def generate_negative_prompt(self) -> str:
        """SDXL-optimized negative prompt"""
        return ("low quality, worst quality, blurry, pixelated, noisy, oversaturated, undersaturated, "
                "bad anatomy, wrong proportions, extra limbs, missing limbs, deformed, mutated, "
                "duplicate, morbid, mutilated, poorly drawn hands, poorly drawn face, mutation, "
                "out of frame, extra fingers, mutated hands, poorly drawn eyes, blurry faces, "
                "bad art, bad illustration, 3d, cartoon, anime, sketches, (worst quality:2), "
                "(low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)), "
                "((grayscale)), skin spots, acnes, skin blemishes, bad anatomy, deepnegative")

class QwenGenerator(BaseModelGenerator):
    """Qwen-optimized prompt generator (natural language style)"""
    
    def generate_prompt(self, subject_type="random", artist_style="random", image_type="random", 
                       insanity=5, manual_subject="", prefix="", suffix="", **kwargs) -> str:
        
        prompt_parts = []
        
        # Qwen prefers natural language descriptions
        if prefix:
            prompt_parts.append(prefix)
        
        # Start with a natural introduction
        intros = ["A beautiful scene featuring", "An artistic depiction of", "A stunning visualization of", 
                 "A creative interpretation of", "An imaginative portrayal of"]
        if insanity >= 5:
            prompt_parts.append(random.choice(intros))
        
        # Subject with natural description
        if manual_subject:
            subject = manual_subject
        else:
            subject = self.get_random_subject(subject_type)
        
        # Add descriptive adjectives for Qwen
        if insanity >= 3:
            adjectives = ["magnificent", "ethereal", "vibrant", "serene", "dynamic", "mystical", "elegant"]
            subject = f"{random.choice(adjectives)} {subject}"
        
        prompt_parts.append(subject)
        
        # Natural language connectors
        if insanity >= 4:
            contexts = [
                "in a breathtaking setting",
                "captured in perfect moment",
                "with incredible attention to detail",
                "showcasing remarkable beauty",
                "in its full glory"
            ]
            prompt_parts.append(random.choice(contexts))
        
        # Time and atmosphere for Qwen
        if insanity >= 6:
            times = ["during golden hour", "at twilight", "under moonlight", "in morning mist", "during sunset"]
            atmospheres = ["with soft natural light", "with dramatic shadows", "in harmonious composition"]
            prompt_parts.append(random.choice(times))
            prompt_parts.append(random.choice(atmospheres))
        
        # Image style in natural language
        if image_type != "none":
            if image_type == "random":
                style = random.choice(self.image_types)
            else:
                style = image_type
            prompt_parts.append(f"created as a {style}")
        
        # Artist mention in natural language
        if artist_style != "none":
            if artist_style == "random":
                artist = random.choice(self.artists)
            else:
                artist = artist_style
            prompt_parts.append(f"in the style reminiscent of {artist}'s work")
        
        # Natural quality descriptions for Qwen
        quality_phrases = [
            "with exceptional quality",
            "creating a masterpiece",
            "resulting in stunning artwork",
            "producing breathtaking imagery"
        ]
        prompt_parts.append(random.choice(quality_phrases))
        
        if suffix:
            prompt_parts.append(suffix)
        
        # Join with proper punctuation for natural language
        return ". ".join(prompt_parts) + "."
    
    def generate_negative_prompt(self) -> str:
        """Qwen-optimized negative prompt (minimal, natural language)"""
        return "poor quality, blurry image, distorted features, unnatural colors, amateur work"

class FluxGenerator(BaseModelGenerator):
    """Flux-optimized prompt generator (creative/artistic style)"""
    
    def generate_prompt(self, subject_type="random", artist_style="random", image_type="random", 
                       insanity=5, manual_subject="", prefix="", suffix="", **kwargs) -> str:
        
        prompt_parts = []
        
        if prefix:
            prompt_parts.append(prefix)
        
        # Flux responds well to creative, artistic descriptions
        if manual_subject:
            subject = manual_subject
        else:
            subject = self.get_random_subject(subject_type)
        
        # Add creative modifiers for Flux
        creative_modifiers = [
            "transcendent", "otherworldly", "dreamlike", "surreal", "cosmic",
            "ethereal", "mystical", "enchanted", "sublime", "visionary"
        ]
        
        if insanity >= 4:
            subject = f"{random.choice(creative_modifiers)} {subject}"
        
        prompt_parts.append(subject)
        
        # Artistic elements for Flux
        if insanity >= 5:
            artistic_elements = [
                "with flowing energy", "radiating cosmic light", "merging with abstract forms",
                "dissolving into color", "transcending reality", "defying physics",
                "existing between dimensions", "pulsing with life", "breathing magic"
            ]
            prompt_parts.append(random.choice(artistic_elements))
        
        # Color and mood for Flux
        if insanity >= 6:
            color_moods = [
                "vibrant neon palette", "deep jewel tones", "iridescent shimmer",
                "chromatic aberration", "bioluminescent glow", "aurora borealis colors",
                "prismatic light", "holographic essence", "liquid metal sheen"
            ]
            prompt_parts.append(random.choice(color_moods))
        
        # Artistic style with creative flair
        if image_type != "none":
            if image_type == "random":
                style = random.choice(self.image_types)
            else:
                style = image_type
            
            # Add artistic movement references for Flux
            movements = ["impressionist", "expressionist", "abstract", "surrealist", "futurist"]
            prompt_parts.append(f"{random.choice(movements)} {style}")
        
        # Composition elements for Flux
        if insanity >= 7:
            compositions = [
                "dynamic composition", "rule of thirds", "golden ratio", "symmetrical balance",
                "spiral composition", "fractal patterns", "sacred geometry", "tessellation"
            ]
            prompt_parts.append(random.choice(compositions))
        
        # Artist style with creative interpretation
        if artist_style != "none":
            if artist_style == "random":
                artist = random.choice(self.artists)
            else:
                artist = artist_style
            prompt_parts.append(f"channeling the creative spirit of {artist}")
        
        # Creative quality descriptors for Flux
        quality_descriptors = [
            "breathtaking artistry", "stunning creativity", "imaginative brilliance",
            "artistic mastery", "creative excellence", "visionary artwork"
        ]
        prompt_parts.append(random.choice(quality_descriptors))
        
        if suffix:
            prompt_parts.append(suffix)
        
        return ", ".join(prompt_parts)
    
    def generate_negative_prompt(self) -> str:
        """Flux-optimized negative prompt (focus on avoiding mundane)"""
        return ("mundane, ordinary, boring, conventional, cliched, uninspired, flat, lifeless, "
                "dull colors, poor composition, lack of creativity, amateur, generic, predictable")

class ModelRegistry:
    """Registry for all available models and their configurations"""
    
    def __init__(self):
        self.models = {
            "sdxl": {
                "config": ModelConfiguration(
                    model_type="sdxl",
                    display_name="SDXL",
                    description="Stable Diffusion XL - Best for photorealistic and highly detailed images",
                    optimal_prompt_style="Technical and detailed with quality tags",
                    supports_negative_prompts=True,
                    supports_weights=True,
                    recommended_settings={
                        "steps": 40,
                        "cfg_scale": 7.5,
                        "width": 1024,
                        "height": 1024,
                        "sampler": "DPM++ 2M Karras"
                    }
                ),
                "generator": SDXLGenerator()
            },
            "qwen": {
                "config": ModelConfiguration(
                    model_type="qwen",
                    display_name="Qwen",
                    description="Natural language model - Best for conversational and descriptive prompts",
                    optimal_prompt_style="Natural language with flowing descriptions",
                    supports_negative_prompts=True,
                    supports_weights=False,
                    recommended_settings={
                        "steps": 30,
                        "cfg_scale": 7,
                        "width": 1024,
                        "height": 1024,
                        "sampler": "Euler a"
                    }
                ),
                "generator": QwenGenerator()
            },
            "flux": {
                "config": ModelConfiguration(
                    model_type="flux",
                    display_name="Flux",
                    description="Creative AI model - Best for artistic and imaginative outputs",
                    optimal_prompt_style="Creative and artistic with mood descriptors",
                    supports_negative_prompts=True,
                    supports_weights=False,
                    recommended_settings={
                        "steps": 25,
                        "cfg_scale": 3.5,
                        "width": 1024,
                        "height": 1024,
                        "sampler": "DPM++ 2M"
                    }
                ),
                "generator": FluxGenerator()
            }
        }
    
    def get_model(self, model_type: str) -> Optional[Dict[str, Any]]:
        """Get model by type"""
        return self.models.get(model_type)
    
    def get_all_models(self) -> Dict[str, ModelConfiguration]:
        """Get all model configurations"""
        return {k: v["config"] for k, v in self.models.items()}
    
    def generate_prompt(self, model_type: str, **kwargs) -> Dict[str, str]:
        """Generate prompt for specific model"""
        model = self.get_model(model_type)
        if not model:
            raise ValueError(f"Unknown model type: {model_type}")
        
        generator = model["generator"]
        prompt = generator.generate_prompt(**kwargs)
        negative_prompt = generator.generate_negative_prompt()
        
        return {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "model": model_type,
            "settings": model["config"].recommended_settings
        }
    
    def generate_all_prompts(self, **kwargs) -> Dict[str, Dict[str, str]]:
        """Generate prompts for all models"""
        results = {}
        for model_type in self.models.keys():
            try:
                results[model_type] = self.generate_prompt(model_type, **kwargs)
            except Exception as e:
                results[model_type] = {"error": str(e)}
        return results
# Create singleton instance
model_registry = ModelRegistry()
