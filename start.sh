#!/bin/bash

# Strukt App - Complete Deployment Guide

set -e

echo "╔════════════════════════════════════════════╗"
echo "║       Strukt App - Deployment Helper       ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Check environment
if [ -z "$1" ]; then
    echo "Usage: ./start.sh [dev|prod|docker|aws]"
    echo ""
    echo "Options:"
    echo "  dev      - Start with HTTP proxy (local Python backend on :8000)"
    echo "  prod     - Start with direct backend calls (monolithic)"
    echo "  docker   - Start with Docker Compose (includes PostgreSQL + Redis)"
    echo "  aws      - Deploy to AWS App Runner"
    echo ""
    exit 1
fi

MODE=$1

case $MODE in
    dev)
        echo "🚀 Starting in DEVELOPMENT mode (HTTP proxy)..."
        echo ""
        echo "Requirements:"
        echo "  - Python backend running on http://127.0.0.1:8000"
        echo "  - Next.js will proxy API calls to Python backend"
        echo ""
        echo "Start Python backend first:"
        echo "  cd backend"
        echo "  python fastapi_main.py"
        echo ""
        echo "Then start Next.js:"
        export BACKEND_DIRECT_CALL=false
        export NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
        npm run dev
        ;;

    prod)
        echo "🚀 Starting in PRODUCTION mode (direct calls)..."
        echo ""
        echo "Setup requirements:"
        echo "  - Install Python dependencies: pip install -r backend/requirements.txt"
        echo "  - Backend functions will be called directly (no HTTP)"
        echo ""
        export NODE_ENV=production
        export BACKEND_DIRECT_CALL=true
        export ENABLE_PYTHON_SUBPROCESS=true
        npm run build
        npm start
        ;;

    docker)
        echo "🐳 Starting with Docker Compose..."
        echo ""
        echo "This will start:"
        echo "  - Next.js + Backend (port 3000)"
        echo "  - PostgreSQL (port 5432)"
        echo "  - Redis (port 6379)"
        echo ""
        
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker not found. Please install Docker."
            exit 1
        fi

        if ! command -v docker-compose &> /dev/null; then
            echo "❌ Docker Compose not found. Please install Docker Compose."
            exit 1
        fi

        docker-compose build
        docker-compose up -d
        
        echo ""
        echo "✅ Services started!"
        echo "📍 App: http://localhost:3000"
        echo "📊 PostgreSQL: localhost:5432 (user: strukt, pass: strukt-dev-password)"
        echo "🔴 Redis: localhost:6379"
        echo ""
        echo "View logs: docker-compose logs -f"
        echo "Stop services: docker-compose down"
        ;;

    aws)
        echo "☁️  Deploying to AWS..."
        echo ""
        
        if ! command -v aws &> /dev/null; then
            echo "❌ AWS CLI not found. Please install AWS CLI v2."
            exit 1
        fi

        if ! command -v docker &> /dev/null; then
            echo "❌ Docker not found. Please install Docker."
            exit 1
        fi

        echo "Checking AWS credentials..."
        ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)
        
        if [ -z "$ACCOUNT" ]; then
            echo "❌ AWS credentials not configured."
            echo "   Run: aws configure"
            exit 1
        fi

        echo "✅ AWS Account: $ACCOUNT"
        echo "✅ Region: ${AWS_REGION:-us-east-1}"
        echo ""
        
        # Run deployment script
        if [ ! -f "deploy-aws.sh" ]; then
            echo "❌ deploy-aws.sh not found in current directory"
            exit 1
        fi

        ./deploy-aws.sh
        ;;

    *)
        echo "❌ Unknown mode: $MODE"
        echo "Valid options: dev, prod, docker, aws"
        exit 1
        ;;
esac
