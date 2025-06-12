# CS144 Final Project ~ spring 25
<img width="1211" alt="Screenshot 2025-06-01 at 4 25 30 PM" src="https://github.com/user-attachments/assets/ba4eac50-3fb0-447e-be67-a4da7f70311e" />

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

Project Overview
NutriBruin enhances the UCLA dining experience by providing personalized nutritional recommendations based on students' fitness goals. The system scrapes daily dining hall menus and provides API endpoints for diet-optimized restaurant and food recommendations.
🎯 Current Status

✅ Backend API: Deployed on Google Cloud Run
✅ Database: MongoDB Atlas configured and connected
✅ Caching: Redis Cloud configured and connected
✅ CI/CD: Automated deployment via Cloud Build
🚧 Web Scraper: Basic implementation (full TypeScript version pending)
🚧 Frontend: In development
🚧 WebAssembly: Planned for performance optimization

🛠 Technology Stack
Backend (Deployed)
Node.js 18 + Express.js + TypeScript
├── Database: MongoDB Atlas (Cloud)
├── Caching: Redis Cloud
├── Deployment: Google Cloud Run
├── Container: Docker
├── Web Scraping: Puppeteer (planned)
└── Testing: Jest + Supertest
Infrastructure
Google Cloud Platform
├── Compute: Cloud Run (auto-scaling, serverless)
├── Build: Cloud Build (automated Docker builds)
├── Secrets: Secret Manager (secure credential storage)
├── Database: MongoDB Atlas (external)
├── Cache: Redis Cloud (external)
└── Monitoring: Cloud Logging
📋 Project Requirements Status
✅ Completed

 Database: MongoDB with Mongoose ODM
 Caching Layer: Redis with TTL policies
 HTTPS: Automatic via Cloud Run
 API Design: RESTful endpoints
 Cloud Deployment: Google Cloud Run (exceeds App Engine requirement)
 CI/CD: Cloud Build automation
 Security: Environment variables via Secret Manager

🚧 In Progress

 Frontend: Simple HTML/CSS/JS interface
 PWA Features: Service worker, offline functionality
 WebAssembly: Nutrition calculations module
 Full Scraper: Complete Puppeteer implementation
 Authentication: Cookie-based sessions

🚀 Quick Start
Access the Deployed API
bash# Test health endpoint
curl https://nutri-bruin-scraper-228340739101.us-central1.run.app/api/scraper/health

# Check stats
curl https://nutri-bruin-scraper-228340739101.us-central1.run.app/api/scraper/stats

# Run scraper (POST)
curl -X POST https://nutri-bruin-scraper-228340739101.us-central1.run.app/api/scraper/run \
  -H "Content-Type: application/json" \
  -d '{"restaurants": ["de-neve"], "dates": ["2025-06-11"]}'
Local Development
bash# Clone repository
git clone https://github.com/your-username/team31.git
cd team31/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB and Redis credentials

# Run development server
npm run dev
🏗 Deployment Architecture
GitHub Repository
    │
    └──> Cloud Build Trigger
              │
              └──> Docker Build
                        │
                        └──> Container Registry
                                  │
                                  └──> Cloud Run Service
                                            │
                                            ├──> MongoDB Atlas
                                            └──> Redis Cloud
📦 Current Implementation
Minimal API Server
The current deployment includes a minimal Express server with:

Health check endpoint for monitoring
Stats endpoint showing configuration status
Basic scraper run endpoint (returns mock response)

Next Steps

Integrate full TypeScript codebase
Implement Puppeteer scraping logic
Add recommendation algorithms
Deploy frontend interface
Set up Cloud Scheduler for automated scraping

🧪 Testing
bash# Run all tests
npm test

# Integration tests
npm run test:mongo
npm run test:redis

# API tests
npm run test:api
📈 Monitoring

Logs: Cloud Console Logs
Metrics: Cloud Run Metrics
Traces: Cloud Trace

🔒 Security

Secrets Management: All credentials stored in Google Secret Manager
HTTPS: Automatic TLS via Cloud Run
Access Control: IAM policies for service accounts
Input Validation: Joi schema validation (pending full implementation)
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

*UCLA CS144 • Spring 2025 • Prof Ryan Rosario • Team 31*


