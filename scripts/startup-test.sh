#!/bin/bash

# =====================================================
# NutriBruin Local Testing Guide
# Run this BEFORE deploying to Google App Engine
# =====================================================

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 NutriBruin Local Test Setup${NC}"
echo "====================================="
echo "📁 Project root: $PROJECT_ROOT"

# 1. Check if .env files exist, if not show what they should contain
echo -e "\n${YELLOW}📋 Checking environment files...${NC}"

if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    echo -e "${YELLOW}⚠️  backend/.env not found!${NC}"
    echo "Create it with the following content:"
    cat << 'EOF'
# backend/.env
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb+srv://andredmai:andredmai_cs144@cluster0.8fd5yxh.mongodb.net/nutri-bruin?retryWrites=true&w=majority&appName=Cluster0
REDIS_HOST=redis-10871.c1.us-central1-2.gce.redns.redis-cloud.com
REDIS_PORT=10871
REDIS_USERNAME=default
REDIS_PASSWORD=4hbAfiyURr40T1bIcbRkmfxXwQT5Sv90
FRONTEND_URL=http://localhost:3001
SCRAPER_ENABLED=true
SCRAPER_SCHEDULE="0 4 * * *"
SCRAPER_CONCURRENCY=3
SCRAPER_TIMEOUT=30000
EOF
else
    echo -e "${GREEN}✅ backend/.env exists${NC}"
fi

if [ ! -f "$PROJECT_ROOT/frontend/.env" ]; then
    echo -e "${YELLOW}⚠️  frontend/.env not found!${NC}"
    echo "Create it with the following content:"
    cat << 'EOF'
# frontend/.env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-key-here
PORT=3001
EOF
else
    echo -e "${GREEN}✅ frontend/.env exists${NC}"
fi

# 2. Create test-local.sh script
echo -e "\n${YELLOW}📝 Creating test-local.sh...${NC}"
cat > "$PROJECT_ROOT/scripts/test-local.sh" << 'TESTSCRIPT'
#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🧪 NutriBruin Local Testing Suite${NC}"
echo "===================================="

# Function to test endpoint
test_endpoint() {
    local url=$1
    local expected=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "$expected" ]; then
        echo -e "${GREEN}✅ PASSED${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (Expected $expected, got $response)"
        return 1
    fi
}

# Function to test POST endpoint
test_post_endpoint() {
    local url=$1
    local data=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    response=$(curl -s -X POST "$url" \
        -H "Content-Type: application/json" \
        -d "$data" \
        -w "\n%{http_code}" | tail -1)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $response)"
        return 1
    fi
}

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Backend Tests
echo -e "\n${YELLOW}Backend API Tests:${NC}"
echo "==================="

test_endpoint "http://localhost:8080/api/health" "200" "Health Check"
test_endpoint "http://localhost:8080/api" "200" "API Root"
test_endpoint "http://localhost:8080/api/scraper/health" "200" "Scraper Health"

# Test recommendations endpoint
test_post_endpoint "http://localhost:8080/api/recommendations" \
    '{"goal":"cutting","lat":34.0689,"lng":-118.4452}' \
    "Recommendations (Cutting)"

test_post_endpoint "http://localhost:8080/api/recommendations" \
    '{"goal":"bulking"}' \
    "Recommendations (Bulking)"

# Frontend Tests
echo -e "\n${YELLOW}Frontend Tests:${NC}"
echo "==============="

test_endpoint "http://localhost:3001" "200" "React App"

# WebAssembly Test
echo -e "\n${YELLOW}WebAssembly Tests:${NC}"
echo "=================="

# Check if WASM files were built
if [ -f "frontend/public/formulae.wasm" ]; then
    echo -e "${GREEN}✅ WASM file exists${NC}"
else
    echo -e "${RED}❌ WASM file not found${NC}"
    echo "Building WebAssembly..."
    cd frontend && npm run asbuild && cd ..
fi

echo -e "\n${GREEN}🎉 Local testing complete!${NC}"
TESTSCRIPT

chmod +x "$PROJECT_ROOT/scripts/test-local.sh"

# 3. Create the main startup script with tests
echo -e "\n${YELLOW}📝 Creating startup-with-tests.sh...${NC}"
cat > "$PROJECT_ROOT/scripts/startup-with-tests.sh" << 'STARTUP'
#!/usr/bin/env bash
set -euo pipefail

# =============================
# 🚀 NutriBruin Project Launcher with Tests
# =============================

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Handle Ctrl+C clean exit
trap ctrl_c INT
function ctrl_c() {
  echo -e "\n🛑 Shutting down NutriBruin..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  exit 0
}

echo "🚀 Starting NutriBruin Full-Stack Application..."
echo "=================================================="

# Check for .env files
if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    echo -e "${RED}❌ backend/.env not found!${NC}"
    echo "Run ./scripts/startup-test.sh for setup instructions"
    exit 1
fi

if [ ! -f "$PROJECT_ROOT/frontend/.env" ]; then
    echo -e "${RED}❌ frontend/.env not found!${NC}"
    echo "Run ./scripts/startup-test.sh for setup instructions"
    exit 1
fi

# Build WebAssembly if needed
if [ ! -f "$PROJECT_ROOT/frontend/public/formulae.wasm" ]; then
    echo "🏗️  Building WebAssembly module..."
    cd "$PROJECT_ROOT/frontend"
    npm run asbuild
    cp build/release.wasm public/formulae.wasm
    cp build/release.js public/formulae.js
fi

# ---- Backend ----
echo "📂 Starting backend..."
cd "$PROJECT_ROOT/backend" || exit 1

echo "📦 Installing backend dependencies..."
npm install

echo "🔨 Building TypeScript backend..."
npm run build

echo "🔧 Starting backend server on http://localhost:8080"
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!

# ---- Frontend ----
echo "📂 Starting frontend..."
cd "$PROJECT_ROOT/frontend" || exit 1

echo "📦 Installing frontend dependencies..."
npm install

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
while ! curl -s http://localhost:8080/api/health > /dev/null; do
    sleep 1
done
echo -e "${GREEN}✅ Backend is ready!${NC}"

echo "🌐 Starting frontend on http://localhost:3001"
npm start > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to start..."
sleep 10

# Run tests
echo -e "\n${YELLOW}Running automated tests...${NC}"
cd "$PROJECT_ROOT"
if [ -f "scripts/test-local.sh" ]; then
    ./scripts/test-local.sh
fi

echo -e "\n${GREEN}🎉 NutriBruin is running!${NC}"
echo "============================"
echo "📱 Frontend: http://localhost:3001"
echo "🔧 Backend API: http://localhost:8080/api"
echo "📊 Health Check: http://localhost:8080/api/health"
echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}"

# Keep script running
wait $BACKEND_PID $FRONTEND_PID
STARTUP

chmod +x "$PROJECT_ROOT/scripts/startup-with-tests.sh"

echo -e "\n${GREEN}✅ Testing setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Create the .env files shown above if they don't exist"
echo "2. Run: ./scripts/startup-with-tests.sh"
echo "3. The script will start both services and run automated tests"
echo "4. Once all tests pass locally, deploy with: ./scripts/deploy/deploy.sh"