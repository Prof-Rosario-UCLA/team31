#!/bin/bash

# =============================
# 🚀 NutriBruin Project Launcher
# =============================

# Handle Ctrl+C clean exit
trap ctrl_c INT
function ctrl_c() {
  echo -e "\n🛑 Shutting down NutriBruin..."
  exit 0
}

# Navigate to project root (if called from nested folder)
cd "$(dirname "$0")"

echo "🚀 Starting NutriBruin Full-Stack Application..."
echo "=================================================="

# Navigate to backend
echo "📂 Navigating to backend..."
cd backend || exit 1


# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Build backend TypeScript
echo "🔨 Building TypeScript backend..."
npm run build

# Start backend server (in background)
echo "🔧 Starting backend server on http://localhost:8080"
npm run dev &
BACKEND_PID=$!

# Return to root and go to frontend
cd ../frontend || exit 1

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Start frontend server (port 3000)
echo "🌐 Starting frontend on http://localhost:3001"
npm start &
FRONTEND_PID=$!

# Wait for frontend and backend
wait $BACKEND_PID $FRONTEND_PID