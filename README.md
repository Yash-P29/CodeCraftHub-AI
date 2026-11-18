# CodeCraftHub AI: Intelligent Learning Management Platform

[![IBM Full Stack Software Developer Certificate](https://img.shields.io/badge/IBM%20Coursera-Full%20Stack%20Developer%20Capstone-blue.svg)](https://www.coursera.org/professional-certificates/ibm-full-stack-cloud-developer)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Python Version](https://img.shields.io/badge/python-%3E%3D3.10-blue.svg)](https://www.python.org/)
[![Express REST API](https://img.shields.io/badge/API-Express%204.x-lightgrey.svg)](https://expressjs.com/)
[![Flask AI Service](https://img.shields.io/badge/AI%20Microservice-Flask%203.x-black.svg)](https://flask.palletsprojects.com/)
[![AI Engine: Google Gemini](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%20API-8B5CF6.svg)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An academic, production-grade full-stack Course Management and Intelligent Learning Platform developed as the Capstone Project for the **IBM Full Stack Software Developer Professional Certificate** on Coursera by **Yash Patil** (Vishwakarma Institute of Technology, Pune).

---

## 1. Project Introduction

**CodeCraftHub AI** is an intelligent, cloud-ready learning management platform combining centralized course administration with real **Large Language Model (LLM)** Generative AI capabilities. The platform connects a responsive modern SaaS dashboard with a Node.js/Express REST API and a dedicated Python/Flask AI microservice powered by the official **Google Gemini API**.

All core course CRUD operations are backed by structured JSON file persistence (`backend/data/courses.json`), and the new **CodeCraft AI** module provides four live, context-grounded educational AI capabilities.

---

## 2. Architecture Overview

```
┌───────────────────────────────────────────────────────────────────┐
│                     Client Browser (User Interface)                │
│                                                                   │
│   • Courses Dashboard (Grid / Table)   • AI Learning Assistant    │
│   • Personalized Study Planner         • Course-Aware AI Tutor    │
│   • Intelligent Recommendations Engine • Toast Notifications      │
└─────────────────┬──────────────────────────────────▲──────────────┘
                  │                                  │
      HTTP/JSON   │                                  │ HTTP/JSON
      Requests    │                                  │ Responses
                  ▼                                  │
┌────────────────────────────────────────────────────┴──────────────┐
│                Node.js & Express REST Backend (Port 5000)         │
│                                                                   │
│   • Course CRUD Controllers & Route Handlers                      │
│   • JSON Storage Manager (`backend/data/courses.json`)            │
│   • Static SPA Web Server (`frontend/index.html`)                 │
│   • AI Proxy Controller & Context Injector (`aiController.js`)    │
└─────────────────┬──────────────────────────────────▲──────────────┘
                  │                                  │
        Internal  │                                  │ Internal
        HTTP/JSON │                                  │ Responses
                  ▼                                  │
┌────────────────────────────────────────────────────┴──────────────┐
│               Python / Flask AI Microservice (Port 5001)          │
│                                                                   │
│   • Environment & Secret Protection (`config.py` loads `.env`)    │
│   • Keyword Context Ranker & Grounder (`context_retriever.py`)     │
│   • Structured Educational Prompts (`prompt_templates.py`)        │
│   • Resilient Gemini Inference Service (`gemini_service.py`)      │
└─────────────────┬──────────────────────────────────▲──────────────┘
                  │                                  │
            HTTPS │                                  │ JSON Stream
             REST │                                  │ & Candidates
                  ▼                                  │
┌────────────────────────────────────────────────────┴──────────────┐
│                    Google Gemini API (Cloud LLM)                   │
│                                                                   │
│   • Primary Model: gemini-3.5-flash-lite                          │
│   • Fallback Models: gemini-3.8-flash, gemini-3.5-flash           │
│   • Temperature: 0.4 | Max Tokens: 1500 | Top-P: 0.95             │
└───────────────────────────────────────────────────────────────────┘
```

---

## 3. Four Integrated Generative AI Features

1. **AI Learning Assistant** (`POST /api/ai/chat`):
   - Interactive conversational tutor providing structured explanations, real-world analogies, code snippets, and follow-up comprehension checks.
   - Built-in suggested prompts for React hooks, REST vs. GraphQL, Docker containerization, and MVC architectural patterns.
2. **Personalized Study Plan Generator** (`POST /api/ai/study-plan`):
   - Generates customizable, multi-phase study roadmaps tailored to the student’s targeted technology, skill level, daily study hours, and deadline.
   - Outputs actionable milestones, coding exercises, deliverables, and one-click clipboard copy.
3. **Course-Aware AI Tutor** (`POST /api/ai/course-tutor`):
   - Grounds AI responses strictly in CodeCraftHub’s active course records stored in `backend/data/courses.json`.
   - Cites verified course IDs (`CRS-101`, `CRS-102`, etc.) and avoids hallucinating non-existent courses.
4. **Intelligent Course Recommendation Engine** (`POST /api/ai/recommendations`):
   - Analyzes student interests, current skills, and career goals.
   - Compares profile against the live catalog and synthesizes matching course sequences with rationale and next steps.

---

## 4. Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Modern SaaS Theme), Vanilla JavaScript (ES6+), FontAwesome 6, Google Fonts |
| **Backend API** | Node.js (v18+ / v24+), Express.js 4.x, CORS, Native Fetch |
| **AI Microservice** | Python 3.11+, Flask 3.x, Flask-CORS, `requests`, `python-dotenv` |
| **Generative AI** | Google Gemini API (`gemini-3.5-flash-lite`, `gemini-3.8-flash`) |
| **Data Persistence** | Pure JSON file-based store (`backend/data/courses.json`) |
| **Testing** | Node.js Test Runner (`backend/tests/`), Python `unittest` (`test_ai_service.py`) |

---

## 5. Project Directory Structure

```
FULL STACK COURSERA PROJECT/
├── backend/
│   ├── ai-service/
│   │   ├── .env                    # Secret environment file (ignored by git)
│   │   ├── .env.example            # Safe placeholder template
│   │   ├── requirements.txt        # Python microservice dependencies
│   │   ├── app.py                  # Flask microservice entry point (Port 5001)
│   │   ├── config.py               # Safe environment loader & key masking
│   │   ├── test_ai_service.py      # Unit & live inference test suite
│   │   └── services/
│   │       ├── gemini_service.py   # Resilient Google Gemini inference engine
│   │       ├── context_retriever.py# Course-aware keyword ranking & grounding
│   │       └── prompt_templates.py # Educational system prompts
│   ├── data/
│   │   ├── courses.json            # Live persistent course storage
│   │   └── courses.default.json    # Demonstration baseline seed data
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── courseController.js # CRUD business logic
│   │   │   └── aiController.js     # AI proxy & context grounding controller
│   │   ├── middleware/
│   │   │   └── errorHandler.js     # Global error handling
│   │   ├── models/
│   │   │   └── courseModel.js      # Data access layer & schema validation
│   │   ├── routes/
│   │   │   ├── courseRoutes.js     # /api/courses router
│   │   │   └── aiRoutes.js         # /api/ai router
│   │   └── app.js                  # Express app setup, CORS & static serving
│   ├── server.js                   # Node.js backend entry point (Port 5000)
│   ├── package.json                # Dependencies and npm scripts
│   └── tests/
│       ├── api.test.js             # Automated 10-point CRUD test suite
│       └── ai.test.js              # Automated AI end-to-end proxy test suite
├── frontend/
│   ├── css/
│   │   └── style.css               # SaaS styles & AI chat/cards styling (#8B5CF6)
│   ├── js/
│   │   ├── api.js                  # CourseAPI and AIApi client services
│   │   ├── app.js                  # Dashboard controller & CRUD handlers
│   │   └── ai.js                   # CodeCraft AI UI state, chat & generators
│   └── index.html                  # Single-page dashboard with AI navigation tabs
├── scripts/
│   └── test-live-e2e.js            # Live end-to-end asset verification
├── .gitignore                      # Strictly ignores .env and log files
├── README.md                       # Comprehensive documentation
├── AI_IMPLEMENTATION.md            # Detailed Generative AI architecture report
└── DEMO_GUIDE.md                   # University faculty assessment guide
```

---

## 6. Installation & Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher; tested on v24.13.0)
- **Python** (v3.10 or higher; tested on v3.11.9)
- **pip** (Python package installer)

### Step 1: Install Node.js Backend Dependencies
```bash
cd backend
npm install
```
*(On Windows PowerShell, use `npm.cmd install`).*

### Step 2: Install Python AI Microservice Dependencies
```bash
cd backend/ai-service
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Inside `backend/ai-service/`:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and configure your credentials:
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.5-flash-lite
   AI_SERVICE_PORT=5001
   NODE_BACKEND_URL=http://localhost:5000
   ```
*(Note: Never commit `.env` to GitHub. It is protected by `.gitignore`).*

---

## 7. Starting the Platform

### Terminal 1: Start the Python AI Microservice (Port 5001)
```bash
cd backend/ai-service
python app.py
```

### Terminal 2: Start the Node.js Express Backend (Port 5000)
```bash
cd backend
node server.js
```

### Accessing the Application
Open your browser and navigate to:
```
http://localhost:5000/
```
The Node.js backend delivers the complete SPA directly on port 5000 with live access to both course management and the Gemini AI capabilities.

---

## 8. Automated Testing

### 1. Run Course CRUD Tests (10 Test Suites)
```bash
cd backend
node tests/api.test.js
```

### 2. Run Python AI Microservice Tests (Live Model Inference)
```bash
cd backend/ai-service
python test_ai_service.py
```

### 3. Run Node.js End-to-End AI Proxy Tests
```bash
cd backend
node tests/ai.test.js
```

### 4. Run Complete Unified Test Suite
```bash
cd backend
npm test
```

---

## 9. Mandatory Assignment Compliance

- **Document Title**: Exactly `CodeCraftHub: Your Learning Management Platform`.
- **Primary Button Background**: Exactly `#8B5CF6` (and hover `#7C3AED`).
- **Delete Button Markup**: `<button class="btn-danger" onclick="handleDelete('${course.id}')">`.
- **JSON Storage**: `backend/data/courses.json` with synchronous persistence.
- **Server-Side AI Secrets**: API keys stay strictly server-side inside `backend/ai-service/.env` and are never exposed to the client browser.

---

## 10. Author Information

- **Author**: Yash Patil
- **Academic Program**: TY AIDS &bull; Div F &bull; Roll No. 58 &bull; PRN 12413270
- **Institution**: Vishwakarma Institute of Technology (VIT), Pune
- **Course**: IBM Full Stack Software Developer Professional Certificate (Coursera)
