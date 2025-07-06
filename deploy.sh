#!/bin/bash

# 🚀 Emote Moder Deployment Script
# This script helps you deploy to Vercel + Render + Redis

echo "🎯 Emote Moder Deployment Script"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin https://github.com/yourusername/emotemoder.git"
    echo "   git push -u origin main"
    exit 1
fi

# Check if all required files exist
echo "📋 Checking required files..."

required_files=(
    "backend/package.json"
    "backend/index.js"
    "frontend/package.json"
    "frontend/vite.config.js"
    "README.md"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    fi
done

echo "✅ All required files found"

# Check environment variables
echo "🔐 Checking environment variables..."

if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating template..."
    cat > .env << EOF
# MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/emotemoder

# Session Security
SESSION_SECRET=your_super_secret_session_key_here

# AI Services
OPENROUTER_API_KEY=sk-or-your-openrouter-key
HUGGINGFACE_API_KEY=hf_your_huggingface_key

# Environment
NODE_ENV=production
EOF
    echo "📝 Created .env template. Please fill in your actual values."
fi

# Check if dependencies are installed
echo "📦 Checking dependencies..."

if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo "✅ Dependencies installed"

# Check if git is up to date
echo "🔄 Checking git status..."

if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    echo "   git add ."
    echo "   git commit -m 'Update before deployment'"
    echo "   git push"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Git is up to date"

# Deployment checklist
echo ""
echo "🎯 Deployment Checklist"
echo "======================"
echo ""
echo "📋 Backend (Render):"
echo "   □ Create Render account"
echo "   □ Connect GitHub repository"
echo "   □ Create Web Service (backend folder)"
echo "   □ Add environment variables:"
echo "     - MONGO_URI"
echo "     - SESSION_SECRET"
echo "     - OPENROUTER_API_KEY"
echo "     - HUGGINGFACE_API_KEY"
echo "     - NODE_ENV=production"
echo "   □ Deploy backend"
echo ""
echo "📋 Redis (Render):"
echo "   □ Create Redis service"
echo "   □ Note Redis URL"
echo "   □ Add REDIS_URL to backend environment"
echo ""
echo "📋 Frontend (Vercel):"
echo "   □ Create Vercel account"
echo "   □ Import GitHub repository"
echo "   □ Configure as Vite project"
echo "   □ Set root directory to 'frontend'"
echo "   □ Add environment variable:"
echo "     - VITE_API_BASE=https://your-backend-url.onrender.com"
echo "   □ Deploy frontend"
echo ""
echo "📋 Post-Deployment:"
echo "   □ Update Google OAuth redirect URIs"
echo "   □ Test all features"
echo "   □ Monitor logs and metrics"
echo ""

# Get backend URL
read -p "Enter your backend URL (e.g., https://emotemoder-backend.onrender.com): " BACKEND_URL

if [ -n "$BACKEND_URL" ]; then
    echo "🔗 Testing backend connection..."
    
    # Test health endpoint
    if curl -s "$BACKEND_URL/health" > /dev/null; then
        echo "✅ Backend is responding"
    else
        echo "❌ Backend is not responding. Please check your deployment."
    fi
fi

echo ""
echo "🎉 Deployment script completed!"
echo ""
echo "📚 Next steps:"
echo "   1. Follow the deployment checklist above"
echo "   2. Read DEPLOYMENT_GUIDE.md for detailed instructions"
echo "   3. Test your deployment thoroughly"
echo "   4. Monitor logs and performance"
echo ""
echo "🔗 Useful URLs:"
echo "   - Render Dashboard: https://dashboard.render.com"
echo "   - Vercel Dashboard: https://vercel.com/dashboard"
echo "   - MongoDB Atlas: https://cloud.mongodb.com"
echo "   - OpenRouter: https://openrouter.ai"
echo "   - Hugging Face: https://huggingface.co"
echo ""
echo "📞 Need help? Check the DEPLOYMENT_GUIDE.md file for troubleshooting tips." 