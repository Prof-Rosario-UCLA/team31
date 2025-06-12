# NutriBruin — your personalized AI nutrition companion for UCLA dining 

*\~ a cs144 web applications final project for spring 25*

[![](https://github.com/your-username/team31/workflows/CI%20Pipeline/badge.svg)](https://github.com/your-username/team31/actions)
[![Deployment Status](https://img.shields.io/badge/deployment-Google%20App%20Engine-blue)](https://team31-cs144.appspot.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)


## Team Members

| Name | Email | Role | Responsibilities |
|------|-------|------|------------------|
| **Ryan Phua** | rphua@g.ucla.edu | Backend Lead | Backend Architecture, WebAssembly, Cloud Infrastructure, Database Design |
| **Andre Mai** | andre.d.mai@gmail.com | Frontend Lead | Frontend Architecture, UI/UX Design, Authentication, Security Implementation |

---

# NutriBruin — UCLA dining nutrition companion

*\~ CS144 Web Applications Final Project • Spring 2025 ~*

[![](https://github.com/your-username/team31/workflows/CI%20Pipeline/badge.svg)](https://github.com/your-username/team31/actions)
[![Deployment Status](https://img.shields.io/badge/deployment-Google%20App%20Engine-blue)](https://team31-cs144.appspot.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1.6-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)

## Team Members

| Name | Email | Role | Responsibilities |
|------|-------|------|------------------|
| **Ryan Phua** | rphua@g.ucla.edu | Backend Lead | Backend Architecture, WebAssembly, Cloud Infrastructure, Database Design |
| **Andre Mai** | andre.d.mai@gmail.com | Frontend Lead | Frontend Architecture, UI/UX Design, Security Implementation |

---

## Project Overview

NutriBruin enhances the UCLA dining experience by providing personalized nutritional recommendations based on students' fitness goals. Our platform analyzes daily dining hall menus to recommend restaurants and foods optimized for cutting or bulking diets.

### 🎯 **Problem Statement**
UCLA students currently have access to basic menu information but lack:
- Quick identification of high-protein, low-calorie foods (cutting)
- Easy discovery of calorie-dense options (bulking)
- Restaurant recommendations based on diet goals
- Distance and calorie burn calculations to dining locations

### 🚀 **Solution**
NutriBruin provides:
- **Diet-Based Recommendations**: Personalized suggestions for cutting or bulking
- **Smart Scoring Algorithm**: Ranks restaurants and foods by nutritional value
- **Location Awareness**: Calculates walking distance and calories burned
- **Daily Menu Scraping**: Automated collection of UCLA dining data
- **Simple Interface**: Mobile-first design with no login required

## 🛠 Technology Stack

### **Frontend Architecture**
```
Simple HTML/CSS/JavaScript
├── Responsive Design: Mobile-first (320px+)
├── Cookie Management: Session persistence
├── API Integration: Fetch with credentials
└── No Framework Required: Vanilla JS
```

### **Backend Architecture**
```
Node.js 18+ + Express.js 4.18 + TypeScript
├── Database: MongoDB 6.0+ with Mongoose ODM
├── Caching: Redis 7.0+ (30-minute recommendations cache)
├── Sessions: Cookie-based anonymous tracking
├── Security: Helmet, CORS, Input Validation
├── Web Scraping: Puppeteer for UCLA dining data
├── Performance: WebAssembly (Extra Credit)
└── Testing: Jest + Supertest
```

### **Infrastructure & Deployment**
```
Google Cloud Platform
├── Compute: Google App Engine (automatic scaling)
├── Database: MongoDB Atlas (cloud-managed)
├── Caching: Redis Cloud (managed service)
├── CI/CD: GitHub Actions (automated build, test, deploy)
├── Monitoring: Google Cloud Operations Suite
└── Security: HTTPS, CSP headers, secure cookie configuration
```

## 📋 Adhering to Final Project Specification

### I. **Core Web Technologies**
- [x] **Semantic HTML5**: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`
- [x] **HTML5 API**: Google Maps Geolocation API integration
- [x] **Responsive Design**: Mobile-first design supporting 320px+ screens
- [x] **Progressive Web App**: Service worker, offline functionality, installable
- [x] **HTTPS**: All communications encrypted via App Engine SSL
- [x] **Single Page Application**: Simple HTML/CSS/JS interface

### II. **Authentication & Security**
- [x] **Cookie Usage**: Session tracking without authentication required
- [x] **Cookie Compliance**: GDPR-compliant cookie consent banner
- [x] **Security Protection**: XSS, CSRF, SQL injection prevention
- [x] **Content Security Policy**: Restrictive CSP headers
- [x] **Input Validation**: Joi schema validation on all endpoints

### III. **Database & Caching**
- [x] **Database**: MongoDB with Mongoose ODM for schema validation
- [x] **Caching Layer**: Redis with hierarchical TTL policies
- [x] **Data Modeling**: Schemas for UserSessions, Restaurants, MenuItems

### IV. **Advanced Features**
- [x] **WebAssembly**: AssemblyScript module for nutrition calculations (Extra Credit)
- [x] **API Integration**: Web scraping UCLA dining data
- [x] **Frontend Framework**: Simple HTML/CSS/JS (no framework needed)
- [x] **Accessibility**: ARIA attributes, keyboard navigation, screen reader support

### V. **Production Deployment**
- [x] **Google App Engine**: Scalable, managed deployment platform
- [x] **CI/CD Pipeline**: GitHub Actions for automated testing and deployment
- [x] **Performance Optimization**: Code splitting, lazy loading, bundle analysis

---

## 🏗 System Architecture

### **High-Level Architecture Diagram**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  HTML/CSS/JS    │    │  Express API    │    │    MongoDB      │
│  (Frontend)     │◄──►│   (Backend)     │◄──►│   (Database)    │
│                 │    │                 │    │                 │
│ • No Auth      │    │ • Controllers   │    │ • UserSessions  │
│ • Cookies      │    │ • Middleware    │    │ • Restaurants   │
│ • Simple UI    │    │ • Services      │    │ • MenuItems     │
│                 │    │ • WebAssembly   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │     Redis       │              │
         │              │   (Caching)     │              │
         │              │                 │              │
         │              │ • Recommendations│              │
         │              │ • Menu Cache    │              │
         │              │ • Sessions      │              │
         │              └─────────────────┘              │
         │                                                │
         ▼                                                ▼
┌─────────────────┐                              ┌─────────────────┐
│ UCLA Dining     │                              │ Google Cloud    │
│ Web Scraper     │                              │   Services      │
│                 │                              │                 │
│ • Puppeteer     │                              │ • App Engine    │
│ • Daily Updates │                              │ • Cloud Build   │
└─────────────────┘                              │ • Operations    │
                                                  └─────────────────┘
```

### **Data Flow Architecture**
1. **User Request**: Browser → Simple Frontend (no routing needed)
2. **API Call**: Frontend → Express API (with session cookie)
3. **Cache Check**: Express → Redis (check for cached recommendations)
4. **Database Query**: Express → MongoDB (if cache miss)
5. **Recommendation Calculation**: Express → Scoring Algorithm
6. **WebAssembly**: Express → WASM module (nutrition calculations)
7. **Response Path**: Database → Express → Frontend → User
8. **Offline Support**: Service Worker intercepts requests → Cache API

## 🚀 Quick Start Guide

### **Prerequisites**
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **Google Cloud SDK** ([Install Guide](https://cloud.google.com/sdk/docs/install))
- **MongoDB Atlas Account** ([Sign Up](https://www.mongodb.com/cloud/atlas))
- **Redis Cloud Account** ([Sign Up](https://redis.com/try-free/))

### **1. Clone Repository**
```bash
git clone https://github.com/your-username/team31.git
cd team31
```

### **2. Install Dependencies**
```bash
# Install backend dependencies
cd backend && npm install
```

### **3. Environment Configuration**
```bash
# Backend environment setup
cd backend
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required Environment Variables:**
```env
# Server Configuration
NODE_ENV=development
PORT=8080

# Database URLs (replace with your cloud instances)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nutri-bruin
REDIS_URL=redis://username:password@host:port

# Security Configuration
FRONTEND_URL=http://localhost:3000
COOKIE_DOMAIN=localhost
```

### **4. Development Server**
```bash
# Start backend
cd backend && npm run dev
```

**Access Points:**
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8080
- 📊 **Health Check**: http://localhost:8080/api/health

## 🏗 Development Setup

#### i. **MongoDB Atlas Setup**
```bash
1. Create MongoDB Atlas cluster at https://cloud.mongodb.com
2. Create database user with read/write permissions
3. Whitelist your IP address (0.0.0.0/0 for development)
4. Get connection string: mongodb+srv://username:password@cluster.mongodb.net
5. Add to .env as MONGODB_URI with your database name appended
```

**Connection String Format:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nutri-bruin?retryWrites=true&w=majority
```

#### ii. **Redis Cloud Setup**

1. Initialize Redis Cloud
  - new account at https://redis.com/try-free/
  - new database (30MB free tier)
  - region: `us-central1` (matches Google Cloud)
2. From dashboard, copy credentials:
   - Host: redis-xxxxx.c1.us-central1-2.gce.redns.redis-cloud.com
   - Port: 10871
   - Username: default 
   - Password: your-specific-password
3. Environment Variables - update `.env`
    ```bash
    # Add to backend/.env
    REDIS_HOST=redis-xxxxx.c1.us-central1-2.gce.redns.redis-cloud.com
    REDIS_PORT=10871
    REDIS_USERNAME=default
    REDIS_PASSWORD=your-redis-password
    ```

#### iii. **Database Integration Testing**
```bash
# Run MongoDB integration tests
npm run test:mongo
# Run Redis integration tests
npm run test:redis
# Run all integration tests 
npm test -- --testPathPattern=integration
```

## 🔧 Build & Deployment

### **Google App Engine Deployment**

#### **Initial Setup**
```bash
# Authenticate with Google Cloud
gcloud auth login

# Set project ID
gcloud config set project your-gcp-project-id

# Initialize App Engine
gcloud app create --region=us-central1
```

#### **Deploy to Production**
```bash
# Build and deploy
cd backend
gcloud app deploy app.yaml --promote
```

### **CI/CD Pipeline**

Our GitHub Actions workflow automatically:
1. **Runs tests** on pull requests
2. **Security scanning** with npm audit
3. **Build verification** for backend
4. **Automatic deployment** to staging on develop branch
5. **Production deployment** on main branch merges

---

# 🧠 Architecture Deep Dive

## **Backend Architecture Decisions**

#### **Express.js + TypeScript Architecture**
```typescript
// Controller → Service pattern (simplified)
export class RecommendationController {
  async getRecommendations(req: Request, res: Response) {
    const { goal, lat, lng } = req.body;
    const recommendations = await RecommendationService.calculate(goal, { lat, lng });
    res.json(recommendations);
  }
}
```

#### **Database Design**

**MongoDB Choice Justification:**
```javascript
// Flexible schema for session tracking
const userSessionSchema = {
  sessionId: String,
  dietChoice: 'cutting' | 'bulking',
  savedRecommendations: Object,
  lastVisit: Date
};
```

#### **Caching Strategy: Redis Implementation**
```typescript
// Simple caching with TTL
const CacheKeys = {
  recommendations: (sessionId: string, goal: string) => `rec:${sessionId}:${goal}`,
  menu: (restaurantId: string, date: string) => `menu:${restaurantId}:${date}`,
  todaysMenu: () => `menu:today:${new Date().toISOString().split('T')[0]}`
};

const CacheTTL = {
  recommendations: 1800, // 30 minutes
  menu: 3600,           // 1 hour
  userSession: 2592000  // 30 days
};
```

## **Scoring Algorithm Implementation**

```typescript
// Cutting: High protein/calorie ratio prioritized
if (goal === 'cutting') {
  score = avgProteinCalorieRatio * 0.4 + 
          (qualityItemCount / totalItems) * 0.3 + 
          (caloriesBurned / 100) * 0.3;
}

// Bulking: Calorie density prioritized  
else {
  score = (avgCaloriesPerOz / 100) * 0.5 + 
          avgProteinCalorieRatio * 0.3 + 
          (itemCount / 50) * 0.2;
}
```

---

## 🧪 Testing Strategy

### **Backend Testing**
```bash
# Unit and integration tests
cd backend
npm test

# API endpoint testing
npm run test:api

# Database integration tests
npm run test:db
```

---

## 📈 Performance Metrics

### **Target Metrics**
- **Response Time**: <200ms for recommendations
- **Cache Hit Rate**: >80%
- **Scraping Time**: <5 minutes for all restaurants
- **Uptime**: 99.9%

---

## 🚀 Roadmap & Future Enhancements

### **Phase 1: MVP (Current)**
- [x] Session-based recommendation system
- [x] Restaurant and menu data models
- [x] Scoring algorithm implementation
- [ ] Web scraper for UCLA dining data
- [ ] Simple frontend interface
- [ ] PWA service worker

### **Phase 2: Enhanced Features**
- [ ] WebAssembly nutrition calculations (Extra Credit)
- [ ] Enhanced offline functionality
- [ ] Performance optimizations

---

## 🤝 Contributing

### **Development Workflow**
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Code Style Guidelines**
- **TypeScript**: Strict mode enabled
- **Backend**: Controller → Service pattern
- **Testing**: Minimum 80% coverage for new features

## 📞 Developer Support

For questions, issues, or contributions:
- **Technical Issues**: Open an issue on GitHub
- **Team Contact**: 
  - Ryan Phua: rphua@g.ucla.edu
  - Andre Mai: andre.d.mai@gmail.com

## 📄 LICENSE (MIT)

*This project is licensed under the MIT License below.*

---

Copyright © 2025  \
Contributors: *Ryan Phua @ryean0* • *Andre Mai @andredmai* 

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

*~ UCLA CS144 • Spring 2025 • Prof Ryan Rosario • Team 31 ~*


