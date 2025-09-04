#!/bin/bash

# OneButtonPrompt Production Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Starting OneButtonPrompt deployment..."

# Configuration
DOMAIN="yourdomain.com"
API_DOMAIN="api.yourdomain.com"
EMAIL="your-email@example.com"
ADSENSE_CLIENT="ca-pub-XXXXXXXXXXXXXXXX"
ADSENSE_SLOT_HEADER="XXXXXXXXXX"
ADSENSE_SLOT_SIDEBAR="XXXXXXXXXX"
ADSENSE_SLOT_FOOTER="XXXXXXXXXX"
GA_ID="G-XXXXXXXXXX"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "Domain: $DOMAIN"
echo "API Domain: $API_DOMAIN"
echo "Email: $EMAIL"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Create deployment directories
echo -e "${YELLOW}📁 Creating deployment directories...${NC}"
mkdir -p ./data/outputs
mkdir -p ./data/csvfiles
mkdir -p ./data/userfiles
mkdir -p ./letsencrypt

# Build backend image
echo -e "${YELLOW}🔨 Building backend Docker image...${NC}"
docker build -f ../Dockerfile.production -t onebuttonprompt-backend:latest ..

# Build frontend image
echo -e "${YELLOW}🔨 Building frontend Docker image...${NC}"
cd ../frontend

# Update environment variables for production
cat > .env.production <<EOF
VITE_API_URL=https://${API_DOMAIN}
VITE_ADSENSE_CLIENT=${ADSENSE_CLIENT}
VITE_ADSENSE_SLOT_HEADER=${ADSENSE_SLOT_HEADER}
VITE_ADSENSE_SLOT_SIDEBAR=${ADSENSE_SLOT_SIDEBAR}
VITE_ADSENSE_SLOT_FOOTER=${ADSENSE_SLOT_FOOTER}
VITE_GA_ID=${GA_ID}
EOF

# Build frontend
docker build -t onebuttonprompt-frontend:latest .

cd ../deploy

# Update docker-compose with correct domains
sed -i "s/yourdomain.com/${DOMAIN}/g" docker-compose.production.yml
sed -i "s/api.yourdomain.com/${API_DOMAIN}/g" docker-compose.production.yml
sed -i "s/your-email@example.com/${EMAIL}/g" docker-compose.production.yml

# Deploy with Docker Compose
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker compose -f docker-compose.production.yml up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check if services are running
if docker compose -f docker-compose.production.yml ps | grep -q "running"; then
    echo -e "${GREEN}✅ Services are running!${NC}"
    echo
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo
    echo "Your application is now available at:"
    echo "  - Frontend: https://${DOMAIN}"
    echo "  - API: https://${API_DOMAIN}"
    echo
    echo "Next steps:"
    echo "1. Update your DNS records to point to this server"
    echo "2. Replace the AdSense placeholders in the configuration"
    echo "3. Replace the Google Analytics ID"
    echo "4. Monitor the logs: docker compose -f docker-compose.production.yml logs -f"
else
    echo -e "${RED}❌ Services failed to start. Check the logs:${NC}"
    docker compose -f docker-compose.production.yml logs
    exit 1
fi