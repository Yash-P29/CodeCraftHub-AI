# CodeCraftHub AI: Academic Live Demonstration Guide

**Project**: CodeCraftHub AI — Intelligent Learning Management Platform  
**Candidate**: Yash Patil  
**Program**: TY AIDS &bull; Div F &bull; Roll No. 58 &bull; PRN 12413270  
**Institute**: Vishwakarma Institute of Technology (VIT), Pune  
**Assessment**: End-Semester Project Assessment / Coursera Capstone Viva  
**Certification**: IBM Full Stack Software Developer Professional Certificate  

---

## 1. Quick Start Commands (Full Stack Multi-Tier Architecture)

Open two terminal windows:

### Terminal 1: Start the Python Flask AI Microservice (Port 5001)
```powershell
cd backend/ai-service
python app.py
```
*Output:*
```text
================================================================
   CodeCraft AI: Python/Flask Generative AI Microservice        
================================================================
[OK] Microservice listening on http://localhost:5001
[OK] Provider: GEMINI | Model: gemini-3.5-flash-lite
[OK] Credentials Status: CONFIGURED
================================================================
```

### Terminal 2: Start the Node.js Express Platform Server (Port 5000)
```powershell
cd backend
node server.js
```
*Output:*
```text
================================================================
   CodeCraftHub: Your Learning Management Platform — Backend    
================================================================
[OK] Server running on http://localhost:5000
[OK] Courses API: http://localhost:5000/api/courses
[OK] CodeCraft AI API: http://localhost:5000/api/ai/health
[OK] Frontend Dashboard: http://localhost:5000/
================================================================
[SQLite] Connected to relational database at backend/data/codecraft.db
```

### Optional: Frontend Development with Hot Reload (Port 3000)
```powershell
cd frontend-react
npm run dev
```

### Browser Navigation
Open your browser and navigate to:
```
http://localhost:5000/
```
The Node.js backend serves the compiled React single-page application directly on port 5000.

---

## 2. High-Impact 90-Second Demonstration Script

| Time | Tab / Section | What to Do & Say |
| :---: | :--- | :--- |
| **0:00 - 0:25** | **Architecture & Modern React Dashboard** | Point to the title `CodeCraftHub: Your Learning Management Platform`, top KPI cards, and the status pills: *"Respected evaluators, this is CodeCraftHub AI. Our architecture integrates a React 19 single-page application, an Express REST backend, a relational SQLite database, and a Python Flask microservice powered by Google Gemini AI. Courses are stored in JSON as required, while user sessions and AI outputs persist in SQLite."* |
| **0:25 - 0:45** | **CRUD & Persistence** | Click **"Add New Course"**, fill in a test course, and click **Create**.<br>*"Course records validate both on the client with React state and on the server via Express schema validation. Updates immediately persist to `backend/data/courses.json`. Editing or deleting uses the mandatory `handleDelete` method and updates metrics in real-time."* |
| **0:45 - 1:05** | **Tab 2: AI Learning Assistant** | Click **"AI Learning Assistant"**. Click the prompt chip **"Explain React hooks"** or type a query, then click **Send**.<br>*"The Node.js backend routes user prompts to our Python Flask service, which invokes the live Google Gemini model (`gemini-3.5-flash-lite`). The response renders rich formatted markdown with syntax-highlighted code blocks, and conversation turns are automatically logged to SQLite."* |
| **1:05 - 1:20** | **Tab 3: Study Planner** | Click **"Study Planner"**. Click **"Load Sample"**, then click **"Generate AI Study Roadmap"**.<br>*"Our planner synthesizes personalized, multi-phase roadmaps based on student time constraints (e.g. 2 hours/day for 30 days). The generated plan provides weekly milestones, exercises, deliverables, and a one-click copy button, while saving to SQLite."* |
| **1:20 - 1:35** | **Tab 4: Course-Aware Tutor** | Click **"Course-Aware Tutor"**. Select a course focus or click **"After React & Node?"**.<br>*"Unlike generic chatbots, our Python microservice ranks and injects real courses from `backend/data/courses.json` directly into the LLM context to ground explanations and cite verified course IDs without hallucinations."* |
| **1:35 - 1:50** | **Tab 5: AI Recommendations** | Click **"AI Recommendations"**. Click the preset **"Cloud DevOps & Microservices"**, then click **"Synthesize Recommendations"**.<br>*"The recommendation engine matches career goals against the catalog and sequences relevant courses. Clicking 'View Course Details' navigates directly back to the course specification modal."* |

---

## 3. Important Endpoints to Show Faculty

### 1. Platform Health Check (Node.js + Hybrid Storage)
```bash
curl http://localhost:5000/api/health
```
```json
{
  "status": "healthy",
  "platform": "CodeCraftHub Learning Management Platform",
  "version": "2.0.0",
  "totalCourses": 6,
  "database": "SQLite + JSON Hybrid Storage"
}
```

### 2. SQLite Relational Data Endpoints
```bash
# Seeded academic user:
curl http://localhost:5000/api/db/users

# Persisted AI conversation turns:
curl http://localhost:5000/api/db/conversations

# Generated study plans:
curl http://localhost:5000/api/db/study-plans
```

### 3. Unified AI Microservice Health Check (Node.js -> Flask)
```bash
curl http://localhost:5000/api/ai/health
```
```json
{
  "status": "healthy",
  "aiService": {
    "online": true,
    "provider": "gemini",
    "model": "gemini-3.5-flash-lite",
    "configured": true,
    "credentialStatus": "active"
  }
}
```

---

## 4. Architectural Defense & Viva Q&A

### Q1: Why use both JSON file storage and SQLite?
> **Answer**: *"This demonstrates a pragmatic hybrid persistence architecture. Course catalog management adheres to the IBM Coursera core JSON storage requirement for lightweight file-based catalog synchronization. SQLite introduces relational capabilities: relational schema normalization, parameterized SQL queries to prevent SQL injection, and permanent storage for user accounts, multi-turn AI chat history, and generated study plans."*

### Q2: Why separate the Python Flask AI service from the Node.js backend?
> **Answer**: *"This microservice separation mirrors modern enterprise cloud architecture. Node.js handles high-throughput asynchronous REST requests, static dashboard delivery, and SQLite operations. Python is the industry standard for AI engineering, allowing us to leverage native AI SDKs, keyword ranking algorithms, and prompt templates in a dedicated, decoupled service."*

### Q3: How does the Course-Aware Tutor prevent AI hallucinations?
> **Answer**: *"We implement retrieval-augmented prompting. Whenever a student asks a course question, Node.js injects current records from `data/courses.json`. Python's `ContextRetriever` scores courses by keyword overlap in titles, categories, and descriptions. The system prompt instructs Gemini to cite only verified course IDs and explicitly disclaim when a topic is absent from the catalog."*

### Q4: How are API keys secured in this full-stack setup?
> **Answer**: *"The Google Gemini API key is stored exclusively in `backend/ai-service/.env`, which is strictly ignored by `.gitignore`. The key is never exposed to frontend JavaScript or client responses. In addition, `GeminiService.redact_key()` redacts any sensitive substrings from logs and exception payloads."*

---

## 5. Automated Testing Commands to Demonstrate
```bash
cd backend
npm test
```
*Executes all 21 automated tests across Course CRUD (10 tests), SQLite Database (5 tests), and Live Gemini AI Inference (6 tests).*
