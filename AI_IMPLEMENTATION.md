# CodeCraft AI: Real Generative AI Implementation Architecture

**Platform**: CodeCraftHub AI — Intelligent Learning Management Platform  
**Certification**: IBM Full Stack Software Developer Professional Certificate (Coursera)  
**Author**: Yash Patil (TY AIDS, Vishwakarma Institute of Technology, Pune)  
**AI Engine**: Google Gemini API (`gemini-3.5-flash-lite` / `gemini-3.8-flash`)  
**Microservice**: Python (Flask, `requests`, `python-dotenv`)  
**Main Backend**: Node.js & Express REST API  
**Persistent Storage**: Structured JSON (`backend/data/courses.json`)  

---

## 1. Executive Architecture Overview

CodeCraft AI demonstrates an enterprise, decoupled full-stack architecture that combines modern web standards with real Generative AI inference:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Frontend Single-Page App                        │
│   • Courses Dashboard (Grid & Table views, CRUD modals, filters)       │
│   • AI Learning Assistant (Interactive chat with suggested prompts)    │
│   • Personalized Study Planner (Custom roadmaps & milestones)          │
│   • Course-Aware AI Tutor (Context-grounded curriculum Q&A)            │
│   • Intelligent Recommendation Engine (Career matching & pathways)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Node.js / Express Backend (Port 5000)             │
│   • Course CRUD Controllers & Route Handlers                           │
│   • Persistent JSON Storage Engine (`backend/data/courses.json`)       │
│   • AI Proxy Controller (`aiController.js` & `aiRoutes.js`)            │
│   • Automatic Context Injection & Request Validation                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Internal HTTP (Port 5001)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Python / Flask AI Microservice (Port 5001)           │
│   • Environment & Secret Management (`config.py` loads `.env`)        │
│   • Context Retriever & Keyword Ranker (`context_retriever.py`)        │
│   • Structured Educational Prompt Templates (`prompt_templates.py`)    │
│   • Resilient Gemini Inference Service (`gemini_service.py`)           │
│   • In-Memory Rate Limiting & Input Sanitization                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS (IPv4 Direct REST API)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         Google Gemini API                              │
│   • Model: gemini-3.5-flash-lite (with fallback to gemini-3.8-flash)   │
│   • Temperature: 0.4 | Max Tokens: 1500 | Top-P: 0.95                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Four Integrated Generative AI Features

### Feature 1: AI Learning Assistant (`POST /api/ai/chat`)
- **Purpose**: Provides computer science students and engineers with conversational technical guidance.
- **Implementation**: Accepts student questions along with conversational history (`history: [{role, content}]`).
- **Prompt Engineering**: Uses `LEARNING_ASSISTANT_SYSTEM` to format responses with clear analogies, bullet points, markdown code blocks, and follow-up comprehension checks.
- **Suggested Prompts**: Built-in chips for React hooks, REST vs. GraphQL, Docker internals, and MVC architecture.

### Feature 2: Personalized Study Plan Generator (`POST /api/ai/study-plan`)
- **Purpose**: Generates custom, milestone-based learning roadmaps tailored to the student's constraints.
- **Inputs**:
  - `subject`: Targeted technology or domain.
  - `skillLevel`: `Beginner`, `Intermediate`, or `Advanced`.
  - `goal`: Concrete capstone or practical deliverable.
  - `studyTime`: Daily time budget (e.g. `2 hours per day`).
  - `duration`: Total timeline (e.g. `30 Days`, `14 Days`).
- **Output**: Multi-phase markdown roadmap detailing weekly milestones, core concepts, hands-on lab exercises, deliverables, and common pitfalls to avoid.

### Feature 3: Course-Aware AI Tutor (`POST /api/ai/course-tutor`)
- **Purpose**: Answers curriculum, syllabus, and prerequisite inquiries strictly grounded in CodeCraftHub’s active courses.
- **Grounding Strategy**:
  - Node.js fetches active courses from `data/courses.json`.
  - Python `ContextRetriever` ranks courses using keyword frequency matching across title, category, description, and instructor.
  - The model prompt is injected with real course metadata:
    ```text
    Course #1 [ID: CRS-101]:
      - Title: Full-Stack Web Development with React and Node.js
      - Instructor: Dr. Sarah Jenkins
      ...
    ```
- **Hallucination Guard**: The system prompt strictly prohibits inventing fictional course IDs or instructors. If a requested topic is not in the catalog, it explicitly states this fact while providing foundational academic advice.

### Feature 4: Intelligent Course Recommendation Engine (`POST /api/ai/recommendations`)
- **Purpose**: Matches student career aspirations to real course offerings.
- **Inputs**: Technical interests, current skills, and target career direction (with quick-presets for Full-Stack, Cloud DevOps, and Data Platform).
- **Output**: Comprehensive narrative career pathway analysis paired with prioritized course cards linking directly to course specifications in the dashboard.

---

## 3. Security, Secret Management & Reliability

1. **Strict Server-Side Key Isolation**:
   - `GEMINI_API_KEY` is loaded exclusively inside the Python Flask microservice from `backend/ai-service/.env`.
   - The frontend JavaScript never has access to the API key.
   - All `.env` files are strictly ignored by `.gitignore`.
   - `.env.example` contains only non-sensitive placeholders.
2. **Secret Redaction in Logs & Error Handlers**:
   - `GeminiService.redact_key()` intercepts error strings and replaces any occurrence of the API key with `[REDACTED_API_KEY]`.
   - Diagnostics endpoints (`/health` and `/api/ai/health`) return masked key signatures (e.g. `AQ.A...3xtg`) rather than raw keys.
3. **Resilience & Model Fallback Cascade**:
   - Implements automated model fallback across `gemini-3.5-flash-lite`, `gemini-3.8-flash`, and `gemini-3.5-flash` in the event of temporary high-demand spikes (HTTP 503).
   - Forces IPv4 connection (`urllib3.util.connection.HAS_IPV6 = False`) to prevent intermittent IPv6 packet timeouts on Wi-Fi connections.
4. **Input Sanitization & Rate Limiting**:
   - Restricts payload sizes to 512KB.
   - Limits prompt lengths to 4,000 characters to prevent prompt injection or token exhaustion.
   - In-memory rate limiting enforces a maximum of 35 requests per minute per IP.

---

## 4. API Reference

| Endpoint | Method | Proxy Route | Description |
| :--- | :---: | :--- | :--- |
| `/api/ai/health` | `GET` | `GET :5001/health` | Check AI microservice connectivity and model status |
| `/api/ai/chat` | `POST` | `POST :5001/ai/chat` | Chat with AI Learning Assistant |
| `/api/ai/study-plan` | `POST` | `POST :5001/ai/study-plan` | Generate personalized study roadmap |
| `/api/ai/course-tutor` | `POST` | `POST :5001/ai/course-tutor` | Ask questions with course catalog context |
| `/api/ai/recommendations` | `POST` | `POST :5001/ai/recommendations` | Generate personalized course recommendations |

---

## 5. Verification Status

| Feature | Integration Status | Live Inference Verified | Latency |
| :--- | :---: | :---: | :---: |
| **AI Learning Assistant** | Completed | **YES** (Google Gemini) | ~3.7s |
| **Personalized Study Planner** | Completed | **YES** (Google Gemini) | ~5.7s |
| **Course-Aware AI Tutor** | Completed | **YES** (Google Gemini) | ~3.1s |
| **Intelligent Recommendations** | Completed | **YES** (Google Gemini) | ~2.9s |
| **Backend Fallback & Recovery** | Completed | **YES** (Automated Cascade) | Instant |
| **Rate Limiter & Validation** | Completed | **YES** (400 & 429 Guards) | Instant |
