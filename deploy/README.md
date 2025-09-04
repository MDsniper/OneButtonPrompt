# OneButtonPrompt Production Deployment Guide

## Prerequisites

1. A VPS or dedicated server with:
   - Ubuntu 20.04+ or similar Linux distribution
   - At least 2GB RAM
   - Docker and Docker Compose installed
   - Domain name pointed to your server

2. Google AdSense account (for monetization)
3. Google Analytics account (optional)

## Quick Deployment

### 1. Prepare Your Server

```bash
# Install Docker (if not already installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Create deployment directory
mkdir -p ~/onebuttonprompt
cd ~/onebuttonprompt
```

### 2. Clone and Configure

```bash
# Clone the repository
git clone https://github.com/yourusername/OneButtonPrompt.git
cd OneButtonPrompt/deploy

# Edit configuration
nano deploy.sh
# Update these values:
# - DOMAIN="yourdomain.com"
# - API_DOMAIN="api.yourdomain.com"
# - EMAIL="your-email@example.com"
# - ADSENSE_CLIENT="ca-pub-XXXXXXXXXXXXXXXX"
# - ADSENSE_SLOT_HEADER="XXXXXXXXXX"
# - ADSENSE_SLOT_SIDEBAR="XXXXXXXXXX"
# - ADSENSE_SLOT_FOOTER="XXXXXXXXXX"
# - GA_ID="G-XXXXXXXXXX"

# Make deploy script executable
chmod +x deploy.sh
```

### 3. Deploy

```bash
# Run deployment
./deploy.sh
```

## Google AdSense Setup

1. Sign up for Google AdSense at https://www.google.com/adsense/
2. Add your website and wait for approval
3. Create ad units:
   - Header ad (responsive horizontal)
   - Sidebar ad (vertical)
   - Footer ad (responsive horizontal)
4. Copy the ad unit IDs and update the configuration

## Alternative Hosting Options

### Option 1: Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

### Option 2: Netlify (Frontend Only)

```bash
# Build frontend
cd frontend
npm run build

# Drag and drop the 'dist' folder to Netlify
```

### Option 3: AWS EC2

1. Launch an EC2 instance (t3.small or larger)
2. Configure security groups (ports 80, 443, 22)
3. SSH into the instance and follow the deployment steps above

### Option 4: DigitalOcean

1. Create a Droplet (2GB RAM minimum)
2. Use the Docker marketplace image
3. Follow the deployment steps above

## Backend API Hosting

### Option 1: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy backend
cd ..
railway login
railway init
railway up
```

### Option 2: Render

1. Connect your GitHub repository
2. Create a new Web Service
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `gunicorn app:app`

### Option 3: Google Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/obp-backend

# Deploy to Cloud Run
gcloud run deploy --image gcr.io/PROJECT-ID/obp-backend --platform managed
```

## SSL/HTTPS Configuration

The production deployment uses Traefik with automatic Let's Encrypt SSL certificates. 
Make sure your domain DNS is properly configured before deployment.

## Monitoring

```bash
# View logs
docker compose -f docker-compose.production.yml logs -f

# Check service status
docker compose -f docker-compose.production.yml ps

# Restart services
docker compose -f docker-compose.production.yml restart
```

## Backup

```bash
# Backup data
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# Restore data
tar -xzf backup-YYYYMMDD.tar.gz
```

## Performance Optimization

1. **CDN Setup**: Use Cloudflare for better performance
2. **Image Optimization**: The frontend build automatically optimizes images
3. **Caching**: Traefik handles caching headers automatically
4. **Rate Limiting**: Configure in Traefik labels if needed

## Troubleshooting

### Services not starting
```bash
docker compose -f docker-compose.production.yml logs
```

### SSL certificate issues
```bash
# Check Traefik logs
docker logs traefik
```

### High memory usage
```bash
# Limit container resources in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 512M
```

## Support

For issues or questions:
- Create an issue on GitHub
- Check the logs for error messages
- Ensure all environment variables are correctly set