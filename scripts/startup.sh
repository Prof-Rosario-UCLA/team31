#!/usr/bin/env bash
set -euo pipefail

# =============================
# 🚀 NutriBruin Project Launcher
# =============================

# Ensure we always run from scripts/ directory
cd "$(dirname "$0")"
PROJECT_ROOT="$(cd .. && pwd)"

# Handle Ctrl+C clean exit
trap ctrl_c INT
function ctrl_c() {
  echo -e "\n🛑 Shutting down NutriBruin..."
  exit 0
}

echo "🚀 Starting NutriBruin Full-Stack Application..."
echo "=================================================="

# ---- Backend ----
echo "📂 Navigating to backend..."
cd "$PROJECT_ROOT/backend" || exit 1

echo "📦 Installing backend dependencies..."
npm install

echo "🔨 Building TypeScript backend..."
npm run build

echo "🔧 Starting backend server on http://localhost:8080"
npm run dev &
BACKEND_PID=$!

# ---- Frontend ----
echo "📂 Navigating to frontend..."
cd "$PROJECT_ROOT/frontend" || exit 1

echo "📦 Installing frontend dependencies..."
npm install

echo "🌐 Starting frontend on http://localhost:3001"
npm start &
FRONTEND_PID=$!

# Wait for both servers
wait $BACKEND_PID $FRONTEND_PID
