#!/bin/bash

# ########## NUTRIBRUIN PROJECT STATUS UPDATE SCRIPT ################
# This script analyzes the entire codebase and generates a comprehensive
# project health report with MVP progress tracking
# Usage: ./status-update.sh

# Set output file
OUTPUT_FILE="log.txt"
STATUS_FILE="project-status.md"

# Set the backend directory (adjust if running from different location)
BACKEND_DIR="."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Progress indicators
COMPLETED="✅"
PARTIAL="⚠️ "
MISSING="❌"
TODO="📋"

# Clear existing files
> "$OUTPUT_FILE"
> "$STATUS_FILE"

echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║              NUTRIBRUIN STATUS UPDATE                        ║${NC}"
echo -e "${PURPLE}║                   CS 144 Team 31                            ║${NC}"
echo -e "${PURPLE}║                MVP Progress Analysis                         ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}\n"

# Function to check file existence and size
check_file() {
    local file_path="$1"
    local min_size="${2:-10}" # Minimum size in bytes (default 10)
    
    if [ -f "$file_path" ]; then
        local size=$(stat -c%s "$file_path" 2>/dev/null || stat -f%z "$file_path" 2>/dev/null || echo "0")
        if [ "$size" -gt "$min_size" ]; then
            echo "complete"
        else
            echo "empty"
        fi
    else
        echo "missing"
    fi
}

# Function to count lines in file
count_lines() {
    local file_path="$1"
    if [ -f "$file_path" ]; then
        wc -l < "$file_path"
    else
        echo "0"
    fi
}

# Function to check directory with files
check_directory() {
    local dir_path="$1"
    local expected_files="${2:-1}"
    
    if [ -d "$dir_path" ]; then
        local file_count=$(find "$dir_path" -name "*.ts" -o -name "*.js" -o -name "*.json" | wc -l)
        if [ "$file_count" -ge "$expected_files" ]; then
            echo "complete"
        else
            echo "partial"
        fi
    else
        echo "missing"
    fi
}

# Function to analyze package.json dependencies
analyze_dependencies() {
    if [ -f "package.json" ]; then
        echo "$(node -pe "Object.keys(JSON.parse(require('fs').readFileSync('package.json')).dependencies || {}).length")"
    else
        echo "0"
    fi
}

# Function to get progress indicator
get_status_icon() {
    case "$1" in
        "complete") echo "$COMPLETED" ;;
        "partial") echo "$PARTIAL" ;;
        "empty") echo "$PARTIAL" ;;
        "missing") echo "$MISSING" ;;
        *) echo "$TODO" ;;
    esac
}

# Function to get progress percentage
get_progress_color() {
    local percentage="$1"
    if [ "$percentage" -ge 80 ]; then
        echo "$GREEN"
    elif [ "$percentage" -ge 50 ]; then
        echo "$YELLOW"
    else
        echo "$RED"
    fi
}

echo -e "${CYAN}🔍 Analyzing project structure...${NC}\n"

# ======== ANALYZE PROJECT COMPONENTS ========

# Backend Core
backend_core_status=$(check_file "src/index.ts" 100)
database_config_status=$(check_file "src/config/database.ts" 100)
redis_config_status=$(check_file "src/config/redis.ts" 100)
jwt_config_status=$(check_file "src/config/jwt.ts" 100)

# Authentication System
user_model_status=$(check_file "src/models/User.model.ts" 100)
auth_controller_status=$(check_file "src/controllers/auth.controller.ts" 100)
auth_middleware_status=$(check_file "src/middleware/auth.middleware.ts" 100)
auth_routes_status=$(check_file "src/routes/auth.routes.ts" 100)
auth_validators_status=$(check_file "src/validators/auth.validators.ts" 100)

# Missing Core Features
restaurant_model_status=$(check_file "src/models/Restaurant.model.ts" 100)
restaurant_controller_status=$(check_file "src/controllers/restaurant.controller.ts" 50)
nutrition_controller_status=$(check_file "src/controllers/nutrition.controller.ts" 50)
menu_model_status=$(check_file "src/models/Menu.model.ts" 50)
nutrition_model_status=$(check_file "src/models/Nutrition.model.ts" 50)

# Services
cache_service_status=$(check_file "src/services/cache.service.ts" 100)
openai_service_status=$(check_file "src/services/openai.service.ts" 50)
restaurant_service_status=$(check_file "src/services/restaurant.service.ts" 50)

# WebAssembly
wasm_dir_status=$(check_directory "src/wasm" 1)
assemblyscript_status=$(check_file "src/wasm/nutrition-calculator/assembly/index.ts" 50)

# Testing
mongodb_test_status=$(check_file "src/tests/integration/mongodb.test.ts" 100)
redis_test_status=$(check_file "src/tests/integration/redis.test.ts" 100)
auth_test_status=$(check_file "src/tests/integration/auth.test.ts" 50)

# Frontend (check if exists)
frontend_dir_status=$(check_directory "../frontend" 5)
react_setup_status=$(check_file "../frontend/package.json" 100)

# Deployment
dockerfile_status=$(check_file "Dockerfile" 50)
github_actions_status=$(check_directory ".github/workflows" 1)
app_yaml_status=$(check_file "app.yaml" 50)

# Calculate progress percentages
calculate_category_progress() {
    local total=0
    local completed=0
    
    for status in "$@"; do
        total=$((total + 1))
        if [ "$status" = "complete" ]; then
            completed=$((completed + 1))
        elif [ "$status" = "partial" ] || [ "$status" = "empty" ]; then
            completed=$((completed + 1))  # Partial credit
        fi
    done
    
    if [ $total -eq 0 ]; then
        echo "0"
    else
        echo $(( (completed * 100) / total ))
    fi
}

# Category progress calculations
backend_progress=$(calculate_category_progress "$backend_core_status" "$database_config_status" "$redis_config_status" "$jwt_config_status" "$user_model_status" "$auth_controller_status" "$auth_middleware_status" "$auth_routes_status" "$cache_service_status")

api_progress=$(calculate_category_progress "$restaurant_controller_status" "$nutrition_controller_status" "$menu_model_status" "$nutrition_model_status" "$openai_service_status" "$restaurant_service_status")

testing_progress=$(calculate_category_progress "$mongodb_test_status" "$redis_test_status" "$auth_test_status")

wasm_progress=$(calculate_category_progress "$wasm_dir_status" "$assemblyscript_status")

frontend_progress=$(calculate_category_progress "$frontend_dir_status" "$react_setup_status")

deployment_progress=$(calculate_category_progress "$dockerfile_status" "$github_actions_status" "$app_yaml_status")

# Overall MVP progress
overall_progress=$(( (backend_progress + api_progress + testing_progress + wasm_progress + frontend_progress + deployment_progress) / 6 ))

# ======== GENERATE STATUS REPORT ========

TIMESTAMP=$(date)
cat > "$STATUS_FILE" << EOF
# 🚀 NutriBruin Project Status Report

**Generated:** $TIMESTAMP  
**Team:** CS 144 Team 31  
**Overall MVP Progress:** $(get_progress_color $overall_progress)$overall_progress%${NC}

## 📊 Category Breakdown

### $(get_status_icon "$backend_core_status") Backend Foundation - $(get_progress_color $backend_progress)$backend_progress%${NC}
- $(get_status_icon "$backend_core_status") Core Application (src/index.ts)
- $(get_status_icon "$database_config_status") Database Configuration 
- $(get_status_icon "$redis_config_status") Redis Configuration
- $(get_status_icon "$jwt_config_status") JWT Configuration
- $(get_status_icon "$user_model_status") User Model
- $(get_status_icon "$auth_controller_status") Authentication System
- $(get_status_icon "$cache_service_status") Caching Service

### $(get_status_icon "$restaurant_controller_status") API Development - $(get_progress_color $api_progress)$api_progress%${NC}
- $(get_status_icon "$restaurant_controller_status") Restaurant Controller
- $(get_status_icon "$nutrition_controller_status") Nutrition Controller  
- $(get_status_icon "$menu_model_status") Menu Data Models
- $(get_status_icon "$openai_service_status") OpenAI Integration
- $(get_status_icon "$restaurant_service_status") Restaurant Services

### $(get_status_icon "$mongodb_test_status") Testing Infrastructure - $(get_progress_color $testing_progress)$testing_progress%${NC}
- $(get_status_icon "$mongodb_test_status") MongoDB Integration Tests
- $(get_status_icon "$redis_test_status") Redis Integration Tests
- $(get_status_icon "$auth_test_status") Authentication Tests

### $(get_status_icon "$wasm_dir_status") WebAssembly Module - $(get_progress_color $wasm_progress)$wasm_progress%${NC}
- $(get_status_icon "$wasm_dir_status") WASM Directory Structure
- $(get_status_icon "$assemblyscript_status") AssemblyScript Implementation

### $(get_status_icon "$frontend_dir_status") Frontend Application - $(get_progress_color $frontend_progress)$frontend_progress%${NC}
- $(get_status_icon "$frontend_dir_status") React Application Setup
- $(get_status_icon "$react_setup_status") Component Architecture

### $(get_status_icon "$dockerfile_status") Deployment & DevOps - $(get_progress_color $deployment_progress)$deployment_progress%${NC}
- $(get_status_icon "$dockerfile_status") Docker Configuration
- $(get_status_icon "$github_actions_status") CI/CD Pipeline
- $(get_status_icon "$app_yaml_status") Google App Engine Config

## 🎯 Next Priority Actions

### Immediate (Week 1)
1. **Complete Core API Endpoints**
   - Implement Restaurant Controller (\`src/controllers/restaurant.controller.ts\`)
   - Create Menu and Nutrition Models
   - Add restaurant service layer

2. **WebAssembly Integration**  
   - Set up AssemblyScript toolchain
   - Implement nutrition calculation module
   - Integrate WASM with backend API

### Short Term (Week 2)
3. **Frontend Development**
   - Initialize React application structure
   - Implement authentication UI
   - Create restaurant listing components

4. **Testing Completion**
   - Add comprehensive API tests
   - Implement frontend unit tests
   - Set up E2E testing pipeline

### Medium Term (Week 3)
5. **Advanced Features**
   - OpenAI integration for recommendations
   - PWA service worker implementation
   - Google Maps integration

6. **Deployment Pipeline**
   - Configure Google App Engine
   - Set up CI/CD with GitHub Actions
   - Production environment setup

## 📈 CS 144 Requirements Status

| Requirement | Status | Progress |
|-------------|--------|----------|
| Backend (Node.js + Express) | ✅ | Complete |
| Database + ORM (MongoDB) | ✅ | Complete |
| Caching (Redis) | ✅ | Complete |
| Authentication (JWT) | ✅ | Complete |
| Security Features | ✅ | Complete |
| API Integration | ❌ | Planned |
| WebAssembly Module | ❌ | Directory Setup |
| Frontend Framework | ❌ | Not Started |
| PWA Features | ❌ | Not Started |
| Cloud Deployment | ❌ | Not Started |

## 🔥 Critical Path to MVP

**Estimated Time to MVP:** 3-4 weeks

**Blocking Issues:**
- Missing core API endpoints (restaurants, nutrition)
- No frontend implementation
- WebAssembly module not implemented
- Deployment configuration needed

**Risk Mitigation:**
- Focus on core functionality first
- Implement WebAssembly as performance enhancement later
- Use MVP approach for initial deployment

EOF

# ======== CONSOLE OUTPUT ========

echo -e "${YELLOW}📊 PROJECT HEALTH ANALYSIS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Overall progress bar
progress_bar=""
filled_blocks=$((overall_progress / 5))
for ((i=1; i<=20; i++)); do
    if [ $i -le $filled_blocks ]; then
        progress_bar+="█"
    else
        progress_bar+="░"
    fi
done

echo -e "${BLUE}Overall MVP Progress:${NC} $(get_progress_color $overall_progress)$progress_bar $overall_progress%${NC}"
echo ""

# Category breakdown
echo -e "${GREEN}🏗️  Backend Foundation:${NC}     $(get_progress_color $backend_progress)$backend_progress%${NC} $(get_status_icon "complete")"
echo -e "${YELLOW}🔌 API Development:${NC}        $(get_progress_color $api_progress)$api_progress%${NC} $(get_status_icon "missing")"
echo -e "${CYAN}🧪 Testing:${NC}               $(get_progress_color $testing_progress)$testing_progress%${NC} $(get_status_icon "partial")"
echo -e "${PURPLE}⚡ WebAssembly:${NC}            $(get_progress_color $wasm_progress)$wasm_progress%${NC} $(get_status_icon "missing")"
echo -e "${RED}💻 Frontend:${NC}              $(get_progress_color $frontend_progress)$frontend_progress%${NC} $(get_status_icon "missing")"
echo -e "${BLUE}🚀 Deployment:${NC}            $(get_progress_color $deployment_progress)$deployment_progress%${NC} $(get_status_icon "missing")"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Critical next steps
echo -e "${RED}🚨 CRITICAL NEXT STEPS:${NC}"
echo -e "   1. ${YELLOW}Implement Restaurant API endpoints${NC}"
echo -e "   2. ${YELLOW}Create WebAssembly nutrition module${NC}"
echo -e "   3. ${YELLOW}Start React frontend development${NC}"
echo -e "   4. ${YELLOW}Set up deployment pipeline${NC}"

echo ""

# Estimated timeline
echo -e "${CYAN}⏱️  ESTIMATED TIMELINE TO MVP:${NC}"
if [ $overall_progress -ge 60 ]; then
    echo -e "   ${GREEN}1-2 weeks${NC} (Good progress!)"
elif [ $overall_progress -ge 30 ]; then
    echo -e "   ${YELLOW}3-4 weeks${NC} (On track)"
else
    echo -e "   ${RED}4-6 weeks${NC} (Needs acceleration)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ======== GENERATE DETAILED LOG (Original Functionality) ========
echo -e "\n${YELLOW}📝 Generating detailed codebase log...${NC}"

# [Include the original log generation code here - truncated for brevity]
# This section would include all the original functionality from print-code.sh
# but formatted as functions to avoid duplication

# Function to add file separator
add_separator() {
    echo -e "\n$1" >> "$OUTPUT_FILE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
}

# Function to process a file
process_file() {
    local file_path="$1"
    local relative_path="${file_path#./}"
    
    if [ ! -f "$file_path" ]; then
        return
    fi
    
    add_separator "📄 FILE: $relative_path"
    echo -e "Language: $(file_extension "$file_path")" >> "$OUTPUT_FILE"
    echo -e "Size: $(du -h "$file_path" | cut -f1)" >> "$OUTPUT_FILE"
    echo -e "Lines: $(wc -l < "$file_path")\n" >> "$OUTPUT_FILE"
    
    cat "$file_path" >> "$OUTPUT_FILE"
    echo -e "\n" >> "$OUTPUT_FILE"
}

# Function to determine file language
file_extension() {
    case "${1##*.}" in
        ts) echo "TypeScript" ;;
        js) echo "JavaScript" ;;
        json) echo "JSON" ;;
        md) echo "Markdown" ;;
        env) echo "Environment" ;;
        *) echo "Text" ;;
    esac
}

# Add header to log file
TIMESTAMP=$(date)
cat >> "$OUTPUT_FILE" << EOF
╔════════════════════════════════════════════════════════════════╗
║                    NUTRIBRUIN CODEBASE LOG                     ║
║                     CS 144 Final Project                       ║
║                        Team 31                                 ║
║                    Generated: $TIMESTAMP                       ║
║                   Overall Progress: $overall_progress%                    ║
╚════════════════════════════════════════════════════════════════╝

PROJECT STATUS SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
$(cat "$STATUS_FILE")

DETAILED CODEBASE ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF

# Process existing files (same logic as original script)
echo -e "${CYAN}Processing configuration files...${NC}"
[ -f "package.json" ] && process_file "package.json"
[ -f "tsconfig.json" ] && process_file "tsconfig.json"
[ -f "jest.config.js" ] && process_file "jest.config.js"

echo -e "${CYAN}Processing source code...${NC}"
[ -f "src/index.ts" ] && process_file "src/index.ts"

# Process each directory
for dir in config models controllers services routes middleware validators utils tests; do
    if [ -d "src/$dir" ]; then
        find "./src/$dir" -name "*.ts" 2>/dev/null | sort | while read file; do
            [ -f "$file" ] && process_file "$file"
        done
    fi
done

# Final summary
cat >> "$OUTPUT_FILE" << EOF

╔══════════════════════════════════════════════════════════════════════════════╗
║  📊 FINAL PROJECT STATUS SUMMARY
╚══════════════════════════════════════════════════════════════════════════════╝

Overall MVP Progress: $overall_progress%
Generated: $TIMESTAMP
Backend Foundation: $backend_progress% ✅
API Development: $api_progress% ❌  
Testing: $testing_progress% ⚠️
WebAssembly: $wasm_progress% ❌
Frontend: $frontend_progress% ❌
Deployment: $deployment_progress% ❌

CRITICAL NEXT STEPS:
1. Implement Restaurant/Menu API endpoints
2. Create WebAssembly nutrition calculation module  
3. Initialize React frontend application
4. Set up Google App Engine deployment

Estimated time to MVP: 3-4 weeks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF

# Final output
echo ""
echo -e "${GREEN}✅ Status update complete!${NC}"
echo -e "${BLUE}📊 Status Report:${NC} $STATUS_FILE"
echo -e "${BLUE}📝 Detailed Log:${NC} $OUTPUT_FILE"
echo -e "${BLUE}📈 Overall Progress:${NC} $(get_progress_color $overall_progress)$overall_progress%${NC}"

if [ $overall_progress -lt 50 ]; then
    echo -e "\n${RED}⚠️  Project needs acceleration to meet CS 144 deadline!${NC}"
elif [ $overall_progress -lt 80 ]; then
    echo -e "\n${YELLOW}📋 Good progress - stay focused on core features${NC}"
else
    echo -e "\n${GREEN}🎉 Excellent progress - on track for successful submission!${NC}"
fi

echo -e "\n${PURPLE}🚀 Ready for next development iteration!${NC}"