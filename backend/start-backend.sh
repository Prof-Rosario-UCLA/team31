#!/bin/bash

# ########## SIMPLE BACKEND STARTUP SCRIPT ################
# For quick backend-only testing

echo "🔧 Starting NutriBruin Backend..."
echo "================================="

# Check if we're in backend directory
if [ ! -f "package.json" ]; then
    if [ -f "backend/package.json" ]; then
        cd backend
    else
        echo "❌ Cannot find backend package.json"
        exit 1
    fi
fi

# Kill any existing process on port 8080
echo "🧹 Cleaning up port 8080..."
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create basic .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating basic .env file..."
    cat > .env << EOF
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/nutri-bruin
REDIS_HOST=localhost
REDIS_PORT=6379
FRONTEND_URL=http://localhost:3000
EOF
    echo "⚠️  Created basic .env - update with your actual database credentials"
fi

echo ""
echo "🚀 Starting backend server..."
echo "   API will be available at: http://localhost:8080"
echo "   Health check: http://localhost:8080/api/health"
echo ""
echo "🛑 Press Ctrl+C to stop"
echo ""

# Start the backend
npm run dev