# OneButtonPrompt

Multi-model AI prompt generator with a clean, portfolio-inspired interface. Generate optimized prompts for SDXL, Qwen, and Flux AI models with one click.

## Features

- **Multi-Model Support**: Generate prompts optimized for SDXL, Qwen, and Flux AI models
- **Manual Subject Input**: Add custom subjects to your prompts
- **Extensive Style Options**: 30+ artist styles and 20+ image types
- **Dark Mode**: Toggle between light and dark themes
- **US Navy Theme**: Professional color scheme with navy blue and gold accents
- **Batch Generation**: Generate up to 10 prompts at once
- **Copy to Clipboard**: Easy one-click copy functionality

## Deployment with Coolify

This project is configured for deployment with [Coolify](https://coolify.io) using Nixpacks buildpack.

### Prerequisites

- Coolify instance running
- GitHub repository connected to Coolify

### Quick Deploy

1. Fork or clone this repository to your GitHub account
2. In Coolify, create a new application
3. Select "GitHub" as the source
4. Choose this repository
5. Coolify will automatically detect the `nixpacks.toml` configuration
6. Deploy!

### Environment Variables

Set these in your Coolify application settings:

```bash
PORT=5000
MULTI_MODEL_SUPPORT=true
```

### Manual Deployment

If you prefer Docker Compose:

```bash
docker-compose up -d --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Tech Stack

- **Backend**: Python Flask with CORS support
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **UI Components**: shadcn/ui
- **Deployment**: Nixpacks, Docker

## API Endpoints

- `GET /models` - List available AI models
- `POST /generate` - Generate a single prompt
- `POST /generate/batch` - Generate multiple prompts

## Development

### Backend
```bash
pip install -r requirements.txt
python simple_server.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## License

MIT