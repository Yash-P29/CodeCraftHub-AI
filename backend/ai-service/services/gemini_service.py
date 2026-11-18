import os
import re
import time
import json
import logging
from typing import Dict, Any, List, Optional
import urllib3.util.connection as urllib3_cn

# Force IPv4 to prevent IPv6 socket hangs on local networks
urllib3_cn.HAS_IPV6 = False

import requests
from config import Config
from services.prompt_templates import (
    LEARNING_ASSISTANT_SYSTEM,
    STUDY_PLAN_SYSTEM,
    COURSE_TUTOR_SYSTEM,
    RECOMMENDATION_SYSTEM
)
from services.context_retriever import ContextRetriever

logger = logging.getLogger("CodeCraftAI")
logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s: %(message)s")

class GeminiService:
    """Production service for real Google Gemini API inference with resilience and fallback"""

    BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
    FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.5-flash"]

    @classmethod
    def sanitize_input(cls, text: str) -> str:
        """Sanitize text to avoid prompt injection or overflow"""
        if not text:
            return ""
        # Truncate to maximum configured length
        truncated = text[:Config.MAX_PROMPT_LENGTH]
        # Remove null bytes
        cleaned = truncated.replace('\x00', '')
        return cleaned.strip()

    @classmethod
    def redact_key(cls, error_msg: str) -> str:
        """Ensure no API key appears in exception messages or logs"""
        if not error_msg or not Config.GEMINI_API_KEY:
            return error_msg
        return error_msg.replace(Config.GEMINI_API_KEY, "[REDACTED_API_KEY]")

    @classmethod
    def _execute_gemini_request(cls, prompt: str, system_instruction: Optional[str] = None) -> Dict[str, Any]:
        """Execute HTTP request against Google Gemini REST API with model fallback and retry"""
        if not Config.is_configured():
            raise ValueError(
                "Gemini API key is not configured. Please set GEMINI_API_KEY in backend/ai-service/.env to enable live AI inference."
            )

        models_to_try = [Config.GEMINI_MODEL]
        for m in cls.FALLBACK_MODELS:
            if m not in models_to_try:
                models_to_try.append(m)

        contents = []
        if system_instruction:
            contents.append({
                "role": "user",
                "parts": [{"text": f"System Directive:\n{system_instruction}\n\nPlease acknowledge and adhere to these directives."}]
            })
            contents.append({
                "role": "model",
                "parts": [{"text": "Understood. I will act strictly according to these directives."}]
            })

        contents.append({
            "role": "user",
            "parts": [{"text": prompt}]
        })

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 1500,
                "topP": 0.95
            }
        }

        last_error = None

        for model in models_to_try:
            url = f"{cls.BASE_URL}/{model}:generateContent?key={Config.GEMINI_API_KEY}"
            headers = {
                "Content-Type": "application/json",
                "Connection": "close"
            }

            for attempt in range(2):  # 1 initial try + 1 retry for transient 503
                try:
                    logger.info(f"Invoking Gemini model: {model} (Attempt {attempt + 1})")
                    start_time = time.time()
                    resp = requests.post(url, json=payload, headers=headers, timeout=Config.REQUEST_TIMEOUT)
                    duration = round(time.time() - start_time, 2)

                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if not candidates:
                            raise ValueError("Gemini returned empty candidate list.")

                        content_parts = candidates[0].get("content", {}).get("parts", [])
                        if not content_parts:
                            raise ValueError("Gemini response missing content parts.")

                        text = content_parts[0].get("text", "")
                        logger.info(f"Gemini responded successfully via {model} in {duration}s ({len(text)} chars)")
                        return {
                            "text": text,
                            "model": model,
                            "duration_seconds": duration
                        }

                    # Handle 503 high demand (retry after brief sleep)
                    if resp.status_code == 503 and attempt == 0:
                        logger.warning(f"Model {model} returned 503 (high demand). Retrying after 1.5s...")
                        time.sleep(1.5)
                        continue

                    # Parse error details safely
                    err_json = resp.json().get("error", {})
                    err_msg = err_json.get("message", f"HTTP {resp.status_code}")
                    last_error = f"{model} error ({resp.status_code}): {err_msg}"
                    logger.warning(cls.redact_key(f"Gemini call to {model} failed: {last_error}"))
                    break  # Break retry loop and try next model

                except requests.exceptions.Timeout:
                    last_error = f"Request to Gemini model {model} timed out after {Config.REQUEST_TIMEOUT}s."
                    logger.warning(last_error)
                    break
                except Exception as ex:
                    last_error = cls.redact_key(f"Exception during {model} call: {type(ex).__name__} - {str(ex)}")
                    logger.warning(last_error)
                    break

        # If all models failed
        clean_error = cls.redact_key(last_error or "All configured Gemini models failed to generate a response.")
        raise RuntimeError(clean_error)

    @classmethod
    def chat(cls, message: str, history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """Feature 1: AI Learning Assistant chat"""
        clean_message = cls.sanitize_input(message)
        if not clean_message:
            raise ValueError("Student message cannot be empty.")

        # Construct prompt including conversational context if provided
        prompt_lines = []
        if history and isinstance(history, list):
            prompt_lines.append("Previous Conversation History:")
            for turn in history[-4:]:  # Include up to last 4 exchanges
                role = turn.get("role", "student").capitalize()
                content = cls.sanitize_input(turn.get("content", ""))
                prompt_lines.append(f"{role}: {content}")
            prompt_lines.append("\nCurrent Question:")

        prompt_lines.append(clean_message)
        full_prompt = "\n".join(prompt_lines)

        result = cls._execute_gemini_request(
            prompt=full_prompt,
            system_instruction=LEARNING_ASSISTANT_SYSTEM
        )
        return {
            "response": result["text"],
            "model": result["model"],
            "latency": result["duration_seconds"]
        }

    @classmethod
    def generate_study_plan(cls, subject: str, skill_level: str, goal: str, study_time: str, duration: str) -> Dict[str, Any]:
        """Feature 2: Personalized Study Plan Generator"""
        s_subj = cls.sanitize_input(subject)
        s_level = cls.sanitize_input(skill_level) or "Beginner"
        s_goal = cls.sanitize_input(goal)
        s_time = cls.sanitize_input(study_time) or "1-2 hours per day"
        s_dur = cls.sanitize_input(duration) or "30 Days"

        if not s_subj or not s_goal:
            raise ValueError("Subject and learning goal are required to generate a personalized study plan.")

        prompt = (
            f"Please generate a complete personalized study roadmap with the following student parameters:\n"
            f"- **Target Subject / Technology**: {s_subj}\n"
            f"- **Current Skill Level**: {s_level}\n"
            f"- **Core Learning Objective / Capstone Goal**: {s_goal}\n"
            f"- **Daily Study Time Available**: {s_time}\n"
            f"- **Target Timeline / Duration**: {s_dur}\n"
        )

        result = cls._execute_gemini_request(
            prompt=prompt,
            system_instruction=STUDY_PLAN_SYSTEM
        )
        return {
            "plan": result["text"],
            "model": result["model"],
            "parameters": {
                "subject": s_subj,
                "skillLevel": s_level,
                "goal": s_goal,
                "studyTime": s_time,
                "duration": s_dur
            },
            "latency": result["duration_seconds"]
        }

    @classmethod
    def answer_course_question(cls, question: str, courses: List[Dict[str, Any]], course_id: Optional[str] = None, history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """Feature 3: Course-Aware AI Tutor"""
        clean_q = cls.sanitize_input(question)
        if not clean_q:
            raise ValueError("Question cannot be empty.")

        # Find relevant course context
        if course_id:
            relevant = [c for c in courses if str(c.get('id')).lower() == str(course_id).lower()]
            if not relevant:
                relevant = ContextRetriever.find_relevant_courses(clean_q, courses, top_k=3)
        else:
            relevant = ContextRetriever.find_relevant_courses(clean_q, courses, top_k=4)

        formatted_context = ContextRetriever.format_courses_for_prompt(relevant)
        system_instruction = COURSE_TUTOR_SYSTEM.format(course_context=formatted_context)

        prompt_lines = []
        if history and isinstance(history, list):
            prompt_lines.append("Previous Discussion:")
            for turn in history[-3:]:
                role = turn.get("role", "student").capitalize()
                content = cls.sanitize_input(turn.get("content", ""))
                prompt_lines.append(f"{role}: {content}")
            prompt_lines.append("\nCurrent Student Question:")

        prompt_lines.append(clean_q)
        full_prompt = "\n".join(prompt_lines)

        result = cls._execute_gemini_request(
            prompt=full_prompt,
            system_instruction=system_instruction
        )
        return {
            "answer": result["text"],
            "referencedCourses": [
                {
                    "id": c.get("id"),
                    "title": c.get("title"),
                    "instructor": c.get("instructor"),
                    "category": c.get("category"),
                    "status": c.get("status")
                }
                for c in relevant
            ],
            "model": result["model"],
            "latency": result["duration_seconds"]
        }

    @classmethod
    def recommend_courses(cls, interests: str, current_skills: str, career_goal: str, courses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Feature 4: Intelligent Course Recommendation Engine"""
        s_int = cls.sanitize_input(interests)
        s_skills = cls.sanitize_input(current_skills) or "Beginner fundamentals"
        s_goal = cls.sanitize_input(career_goal)

        if not s_int or not s_goal:
            raise ValueError("Interests and target career goal are required for intelligent recommendations.")

        # Retrieve relevant active/upcoming courses
        relevant = ContextRetriever.find_relevant_courses(f"{s_int} {s_goal}", courses, top_k=6)
        formatted_context = ContextRetriever.format_courses_for_prompt(relevant)
        system_instruction = RECOMMENDATION_SYSTEM.format(course_context=formatted_context)

        prompt = (
            f"Please evaluate this student profile and recommend the most effective courses from our catalog:\n"
            f"- **Student Academic / Tech Interests**: {s_int}\n"
            f"- **Existing Competencies & Skills**: {s_skills}\n"
            f"- **Target Career Path / Industry Goal**: {s_goal}\n"
        )

        result = cls._execute_gemini_request(
            prompt=prompt,
            system_instruction=system_instruction
        )
        return {
            "analysis": result["text"],
            "recommendedCourses": [
                {
                    "id": c.get("id"),
                    "title": c.get("title"),
                    "instructor": c.get("instructor"),
                    "category": c.get("category"),
                    "status": c.get("status"),
                    "rating": c.get("rating")
                }
                for c in relevant
            ],
            "model": result["model"],
            "latency": result["duration_seconds"]
        }
