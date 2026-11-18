# CodeCraftHub AI: Intelligent Learning Management Platform

[![IBM Full Stack Software Developer Certificate](https://img.shields.io/badge/IBM%20Coursera-Full%20Stack%20Developer%20Capstone-blue.svg)](https://www.coursera.org/professional-certificates/ibm-full-stack-cloud-developer)
[![React Version](https://img.shields.io/badge/React-19.x%20%2B%20Vite-61DAFB.svg)](https://react.dev/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Python Version](https://img.shields.io/badge/python-%3E%3D3.10-blue.svg)](https://www.python.org/)
[![Express REST API](https://img.shields.io/badge/API-Express%204.x-lightgrey.svg)](https://expressjs.com/)
[![Database: SQLite](https://img.shields.io/badge/Database-SQLite%203-003B57.svg)](https://www.sqlite.org/)
[![Flask AI Service](https://img.shields.io/badge/AI%20Microservice-Flask%203.x-black.svg)](https://flask.palletsprojects.com/)
[![AI Engine: Google Gemini](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%20API-8B5CF6.svg)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An academic, production-grade full-stack Course Management and Intelligent Learning Platform developed as the Capstone Project for the **IBM Full Stack Software Developer Professional Certificate** on Coursera by **Yash Patil** (Vishwakarma Institute of Technology, Pune).

---

## 1. Project Introduction

**CodeCraftHub AI** is an intelligent, cloud-ready learning management platform combining centralized course administration with real **Large Language Model (LLM)** Generative AI capabilities. The platform connects a modern **React + Vite** single-page application with a **Node.js/Express REST API**, a relational **SQLite database**, and a dedicated **Python/Flask AI microservice** powered by the official **Google Gemini API**.

All core course CRUD operations are backed by structured JSON file persistence (`backend/data/courses.json`), learner activities and AI sessions are persisted in relational SQLite tables (`backend/data/codecraft.db`), and the **CodeCraft AI** module provides four live, context-grounded educational AI capabilities.

---

## 2. Architecture Overview

```
┌───────────────────────────────────────────────────────────────────┐
│              Client Browser: React 19 + Vite Application          │
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
│   • SQLite Database Layer (`backend/data/codecraft.db`)           │
│   • Static SPA Server (serves React `dist/` or fallback)          │
│   • AI Proxy Controller & Context Injector (`aiController.js`)    │
└────────┬───────────────────────────────────────────▲──────────────┘
         │                                           │
         │ SQLite                                    │ Internal
         │ Queries                                   │ Responses
         ▼                                           │
┌────────────────────────┐         ┌─────────────────┴──────────────┐
│  SQLite 3 Database     │         │ Python / Flask AI Microservice │
│                        │         │          (Port 5001)           │
│ • users                │         │                                │
│ • ai_conversations     │         │ • Secret Protection (`.env`)   │
│ • study_plans          │         │ • Context Grounder (courses)   │
│ • activity_logs        │         │ • Structured Prompts           │
└────────────────────────┘         │ • Resilient Gemini Inference   │
                                   └─────────────────┬──────────────┘
                                                     │ HTTPS REST
                                                     ▼
                                   ┌────────────────────────────────┐
                                   │ Google Gemini API (Cloud LLM)  │
                                   │ Model: gemini-3.5-flash-lite   │
                                   └────────────────────────────────┘
```

---

## 3. Four Integrated Generative AI Features

1. **AI Learning Assistant** (`POST /api/ai/chat`):
   - Interactive conversational tutor providing structured explanations, real-world analogies, code snippets, and follow-up comprehension checks.
   - Built-in suggested prompts for React hooks, REST vs. GraphQL, Docker containerization, and MVC architectural patterns.
   - Saves conversations to the SQLite database.
2. **Personalized Study Plan Generator** (`POST /api/ai/study-plan`):
   - Generates customizable, multi-phase study roadmaps tailored to the student’s targeted technology, skill level, daily study hours, and deadline.
   - Outputs actionable milestones, coding exercises, deliverables, and one-click clipboard copy.
   - Saves synthesized roadmaps into SQLite.
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
| **Frontend** | React 19, Vite 6, Modern Dark SaaS Theme, FontAwesome 6, Google Fonts |
| **Backend API** | Node.js (v18+ / v24+), Express.js 4.x, CORS, Native Fetch |
| **Database** | SQLite 3 (`sqlite3`), Parameterized SQL Queries, Automated Schema Creation |
| **AI Microservice** | Python 3.11+, Flask 3.x, Flask-CORS, `requests`, `python-dotenv` |
| **Generative AI** | Google Gemini API (`gemini-3.5-flash-lite`, `gemini-3.8-flash`) |
| **Course Persistence** | Pure JSON file-based store (`backend/data/courses.json`) |
| **Version Control** | Git, GitHub |
| **Testing** | Node.js Test Runner (Course API, SQLite DB, AI Proxy), Python `unittest` |

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
│   │   ├── codecraft.db            # SQLite relational database (ignored by git)
│   │   ├── courses.json            # Live persistent course storage
│   │   └── courses.default.json    # Demonstration baseline seed data
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── courseController.js # CRUD business logic
│   │   │   ├── aiController.js     # AI proxy, SQLite logging & context controller
│   │   │   └── databaseController.js # REST endpoints for SQLite data
│   │   ├── database/
│   │   │   └── sqlite.js           # SQLite schema and parameterized service
│   │   ├── middleware/
│   │   │   └── errorHandler.js     # Global error handling
│   │   ├── models/
│   │   │   └── courseModel.js      # Data access layer & schema validation
│   │   ├── routes/
│   │   │   ├── courseRoutes.js     # /api/courses router
│   │   │   ├── aiRoutes.js         # /api/ai router
│   │   │   └── databaseRoutes.js   # /api/db router
│   │   └── app.js                  # Express app setup, CORS & React dist serving
│   ├── server.js                   # Node.js backend entry point (Port 5000)
│   ├── package.json                # Dependencies and npm scripts
│   └── tests/
│       ├── api.test.js             # Automated 10-point CRUD test suite
│       ├── ai.test.js              # Automated AI end-to-end proxy test suite
│       └── database.test.js        # Automated SQLite database test suite
├── frontend-react/                 # React + Vite Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/                 # ChatAssistant, StudyPlanner, CourseTutor, Recommendations
│   │   │   ├── dashboard/          # MetricsBar, Toolbar, CourseCard, CourseGrid, CourseTable, EmptyState
│   │   │   ├── layout/             # Header, NavTabs, Footer
│   │   │   ├── modals/             # AddCourseModal, EditCourseModal, CourseDetailsModal, DeleteConfirmModal
│   │   │   └── shared/             # ToastContainer
│   │   ├── hooks/useToast.js       # Toast notifications
│   │   ├── services/               # courseApi.js, aiApi.js
│   │   ├── utils/markdown.js       # Markdown renderer & initials
│   │   ├── App.jsx                 # Top-level state and routing
│   │   ├── index.css               # Shared SaaS styling (#8B5CF6)
│   │   └── main.jsx                # Vite entry
│   ├── vite.config.js              # Vite config with proxy & build to ../frontend/dist
│   └── package.json
├── frontend/                       # Built static bundle & legacy vanilla fallback
│   ├── dist/                       # Vite production build (served by Express)
│   ├── css/style.css
│   └── index.html
├── .gitignore                      # Strictly ignores .env, .db, and build files
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

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Install React Frontend Dependencies & Build
```bash
cd frontend-react
npm install
npm run build
```
*(Outputs optimized production bundle to `frontend/dist`).*

### Step 3: Install Python AI Microservice Dependencies
```bash
cd backend/ai-service
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
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

### Optional: Frontend Development Mode (Port 3000 with Hot Reload)
```bash
cd frontend-react
npm run dev
```

### Accessing the Application
Open your browser and navigate to:
```
http://localhost:5000/
```
The Node.js backend serves the compiled React application directly on port 5000 with live access to course management, the SQLite database, and the Gemini AI capabilities.

---

## 8. Automated Testing

All three layers of the application are covered by automated test suites:

### 1. Run Complete Unified Test Suite (Recommended)
```bash
cd backend
npm test
```
*This executes:*
1. **Course CRUD Tests** (`tests/api.test.js`) &mdash; 10 test suites covering all HTTP methods, JSON persistence, validation rules, query filtering, and error handling.
2. **SQLite Database Tests** (`tests/database.test.js`) &mdash; 5 test suites verifying user seeding, AI conversation persistence, study plan storage, learning activity logging, and SQL injection protection.
3. **AI Proxy End-to-End Tests** (`tests/ai.test.js`) &mdash; 6 test suites verifying live Google Gemini model inference, multi-turn chat, catalog-grounded tutoring, study plan generation, and security guards.

### Individual Test Commands
```bash
cd backend
npm run test:courses   # Only Course CRUD tests
npm run test:db        # Only SQLite tests
npm run test:ai        # Only Live Gemini AI tests
```

---

## 9. Mandatory Assignment Compliance

- **Document Title**: Exactly `CodeCraftHub: Your Learning Management Platform`.
- **Primary Button Background**: Exactly `#8B5CF6` (and hover `#7C3AED`).
- **Delete Button Markup**: `<button className="btn-danger" onClick={() => handleDelete(course.id)}>`.
- **JSON Storage**: `backend/data/courses.json` with synchronous persistence.
- **Relational Database**: SQLite 3 with parameterized queries and relational tables.
- **Server-Side AI Secrets**: API keys stay strictly server-side inside `backend/ai-service/.env` and are never exposed to the client browser.

---

## 10. Author Information

- **Author**: Yash Patil
- **Academic Program**: TY AIDS &bull; Div F &bull; Roll No. 58 &bull; PRN 12413270
- **Institution**: Vishwakarma Institute of Technology (VIT), Pune
- **Course**: IBM Full Stack Software Developer Professional Certificate (Coursera)
