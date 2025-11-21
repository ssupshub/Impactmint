#!/bin/bash

# ImpactMint Deployment Script
# This script builds and deploys the Docker containers

set -e  # Exit on error

echo "🚀 Starting ImpactMint deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please copy env.docker.example to .env and fill in your values"
    exit 1
fi

# Load environment variables
source .env

# Check required environment variables
required_vars=("MONGO_ROOT_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET" "HEDERA_OPERATOR_ID" "HEDERA_OPERATOR_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set in .env file"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build images
echo "🔨 Building Docker images..."
docker-compose build --no-cache

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
docker-compose ps

# Run database migrations/seeds if needed
echo "🌱 Seeding database..."
docker-compose exec -T backend npm run seed:methodologies || echo "⚠️  Seed script not found or already seeded"

echo "✅ Deployment complete!"
echo ""
echo "📊 Service URLs:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:5000"
echo "  - API Health: http://localhost:5000/health"
echo "  - MongoDB: mongodb://localhost:27017"
echo "  - Redis: redis://localhost:6379"
echo ""
echo "📝 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
