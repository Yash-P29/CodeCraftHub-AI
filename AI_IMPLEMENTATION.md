# CodeCraftHub AI: Intelligent Microservice Architecture & Gemini Integration

**Author**: Yash Patil  
**Institution**: Vishwakarma Institute of Technology (VIT), Pune &bull; TY AIDS  
**Course**: IBM Full Stack Software Developer Professional Certificate Capstone  
**Version**: 2.0.0 (Consolidated Full-Stack AI Release)  

---

## 1. Architectural Vision

**CodeCraftHub AI** combines a modern React 19 single-page application with a high-throughput Node.js/Express REST backend, an SQLite relational database, and a decoupled Python/Flask microservice orchestrating live LLM inference through Google Gemini.

```
React 19 Frontend (SPA)
       │ (REST / JSON)
       ▼
Node.js Express Backend (Port 5000)
 ├── Course Catalog (data/courses.json)
 ├── Relational Store (data/codecraft.db via SQLite3)
 └── AI Reverse Proxy (/api/ai/*)
       │ (Internal HTTP)
       ▼
Python Flask AI Microservice (Port 5001)
 ├── Security & Secret Isolation (.env, key masking)
 ├── Keyword Context Grounding (context_retriever.py)
 └── Resilient Model Invocation (gemini_service.py)
       │ (HTTPS REST)
       ▼
Google Gemini API (gemini-3.5-flash-lite)
```

---

## 2. The Four Generative AI Capabilities

### Feature 1: AI Learning Assistant (`POST /api/ai/chat`)
- **System Prompt**: Senior software engineering mentor persona.
- **Capabilities**: Conceptual code breakdowns, trade-off comparisons, interactive follow-ups.
- **Persistence**: Logged to SQLite `ai_conversations` table linked to user sessions.

### Feature 2: Personalized Study Plan Generator (`POST /api/ai/study-plan`)
- **System Prompt**: Academic curriculum designer.
- **Inputs**: Target subject, current skill level, primary objective, daily study hours, timeline.
- **Output**: Multi-phase study roadmap with weekly targets, hands-on lab projects, and deliverables.
- **Persistence**: Logged to SQLite `study_plans` table.

### Feature 3: Course-Aware AI Tutor (`POST /api/ai/course-tutor`)
- **System Prompt**: Grounded catalog specialist with strict anti-hallucination guardrails.
- **Mechanism**: The Node.js backend retrieves courses from `data/courses.json`. Python's `ContextRetriever` ranks courses using keyword overlap. Only verified course records are injected into the context.

### Feature 4: Intelligent Course Recommendation Engine (`POST /api/ai/recommendations`)
- **System Prompt**: Career pathway advisor.
- **Inputs**: Technical interests, existing skill foundations, career goal.
- **Output**: Strategic sequence of relevant courses from the catalog with pedagogical rationale.

---

## 3. Security & Operational Resilience

1. **Credential Isolation**: The Google Gemini API key resides exclusively in `backend/ai-service/.env`. It is never bundled into client JavaScript or sent over the public network.
2. **Key Masking**: Health check responses and log messages automatically redact secret keys.
3. **Resilient Cascading**: Primary model `gemini-3.5-flash-lite` with automatic fallbacks to `gemini-3.8-flash` and `gemini-3.5-flash`.
4. **IPv4 Network Stability**: Socket-level enforcement prevents IPv6 route resolution timeouts on Windows workstations.
5. **SQL Injection Defense**: All SQLite queries use parameterized placeholders (`?`).

---

## 4. Test Verification Summary

All 21 automated integration tests pass 100%:
- **Course CRUD Suite** (10 tests): `backend/tests/api.test.js`
- **SQLite Database Suite** (5 tests): `backend/tests/database.test.js`
- **Node.js AI Proxy Suite** (6 tests): `backend/tests/ai.test.js`
