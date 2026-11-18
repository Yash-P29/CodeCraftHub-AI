# CodeCraftHub AI: Academic Live Demonstration Guide

**Project**: CodeCraftHub AI — Intelligent Learning Management Platform  
**Candidate**: Yash Patil  
**Program**: TY AIDS &bull; Div F &bull; Roll No. 58 &bull; PRN 12413270  
**Institute**: Vishwakarma Institute of Technology (VIT), Pune  
**Assessment**: End-Semester Project Assessment / Coursera Capstone Viva  
**Certification**: IBM Full Stack Software Developer Professional Certificate  

---

## 1. Quick Start Commands (Dual Microservice Architecture)

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
```

### Browser Navigation
Open your browser and navigate to:
```
http://localhost:5000/
```

---

## 2. High-Impact 90-Second Demonstration Script

| Time | Tab / Section | What to Do & Say |
| :---: | :--- | :--- |
| **0:00 - 0:20** | **Overview & Dual Stack** | Point to the browser title `CodeCraftHub: Your Learning Management Platform`, top KPI cards, and the glowing green & purple status pills: *"Respected evaluators, this is CodeCraftHub AI. Our architecture connects an Express.js REST API with a dedicated Python/Flask AI microservice powered by live Google Gemini LLM inference. All course records are persistently maintained in JSON format."* |
| **0:20 - 0:40** | **Tab 2: AI Learning Assistant** | Click **"AI Learning Assistant"**. Click the prompt chip **"Explain React hooks"** or type a question. Click **Send**.<br>*"Here, the student interacts with a live AI Learning Assistant. The Node.js backend routes the request to our Python Flask service, which invokes the Gemini LLM with structured educational directives. Notice the formatted markdown explanation, code blocks, and model metadata."* |
| **0:40 - 0:55** | **Tab 3: Study Planner** | Click **"Study Planner"**. Click **"Load Sample"**, then click **"Generate AI Study Roadmap"**.<br>*"Our second feature synthesizes personalized, multi-phase roadmaps based on the student's constraints (e.g. 2 hours/day for 30 days). Gemini constructs concrete weekly milestones, hands-on lab exercises, and deliverables with one-click clipboard copying."* |
| **0:55 - 1:15** | **Tab 4: Course-Aware Tutor** | Click **"Course-Aware Tutor"**. Click **"After React & Node?"** or ask *"What topics are covered in CRS-102?"*<br>*"Notice how the AI cites verified courses like `[CRS-102: Cloud Native Architecture]`. Unlike generic chatbots, our Python service ranks and injects real courses from `backend/data/courses.json` directly into the LLM context to prevent hallucinations."* |
| **1:15 - 1:30** | **Tab 5: AI Recommendations** | Click **"AI Recommendations"**. Click the preset **"Cloud DevOps & Microservices"**, then click **"Synthesize Recommendations"**.<br>*"Our fourth capability matches student career goals to the catalog, generating a prioritized learning sequence and actionable next steps. Notice how clicking any suggested course seamlessly navigates back to the catalog view."* |

---

## 3. Important Endpoints to Show Faculty

### 1. Unified AI Health Check (Node.js -> Flask)
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
    "credentialStatus": "active",
    "maskedKey": "AQ.A...3xtg"
  }
}
```

### 2. Live Chat Request via Node.js
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is an asynchronous promise in JavaScript in 1 sentence?"}'
```

### 3. Course-Aware Inquiries Grounded in JSON Storage
```bash
curl -X POST http://localhost:5000/api/ai/course-tutor \
  -H "Content-Type: application/json" \
  -d '{"question": "Summarize what course CRS-101 teaches."}'
```

---

## 4. Architectural Defense & Viva Q&A

### Q1: Why separate the Python Flask AI service from the Node.js backend?
> **Answer**: *"This microservice separation mirrors modern enterprise cloud architecture. Node.js handles high-throughput asynchronous REST requests, static dashboard delivery, and local file I/O. Python is the industry standard for AI engineering, allowing us to leverage native AI SDKs, keyword ranking algorithms, and prompt templates in a dedicated, decoupled service."*

### Q2: How does the Course-Aware Tutor prevent AI hallucinations?
> **Answer**: *"We implement retrieval-augmented prompting. Whenever a student asks a course question, Node.js injects current records from `data/courses.json`. Python's `ContextRetriever` scores courses by keyword overlap in titles, categories, and descriptions. The system prompt instructs Gemini to cite only verified course IDs and explicitly disclaim when a topic is absent from the catalog."*

### Q3: How are API keys secured in this full-stack setup?
> **Answer**: *"The Google Gemini API key is stored exclusively in `backend/ai-service/.env`, which is strictly ignored by `.gitignore`. The key is never exposed to frontend JavaScript or client responses. In addition, `GeminiService.redact_key()` redacts any sensitive substrings from logs and exception payloads."*

---

## 5. Troubleshooting Matrix

| Symptom | Cause | Remedy |
| :--- | :--- | :--- |
| **"AI Microservice Offline" pill** | Python Flask process is not running. | Run `cd backend/ai-service && python app.py`. |
| **"Backend Offline" badge** | Node.js process is not running. | Run `cd backend && node server.js`. |
| **High demand / 503 error from Gemini** | Temporary traffic spike on Google API. | Built-in fallback automatically cascades to `gemini-3.8-flash` or `gemini-3.5-flash`. |
| **PowerShell script error** | Execution policy restrictions. | Use `npm.cmd test` or run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`. |
