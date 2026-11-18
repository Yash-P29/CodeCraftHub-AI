import time
import logging
from collections import defaultdict
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from services.gemini_service import GeminiService

# Configure logging
logging.basicConfig(level=logging.INFO, format="[%(asctime)s] [AI Service] %(levelname)s: %(message)s")
logger = logging.getLogger("FlaskAIService")

app = Flask(__name__)
# Restrict request payload size to 512KB
app.config['MAX_CONTENT_LENGTH'] = 512 * 1024
CORS(app, origins="*")

# Simple in-memory rate limiter: max 30 requests per IP per minute
rate_limits = defaultdict(list)
RATE_LIMIT_MAX = 35
RATE_LIMIT_WINDOW = 60  # seconds

def check_rate_limit(client_ip: str) -> bool:
    now = time.time()
    timestamps = [t for t in rate_limits[client_ip] if now - t < RATE_LIMIT_WINDOW]
    rate_limits[client_ip] = timestamps
    if len(timestamps) >= RATE_LIMIT_MAX:
        return False
    rate_limits[client_ip].append(now)
    return True

@app.before_request
def apply_rate_limit():
    if request.endpoint == 'health_check':
        return None
    client_ip = request.remote_addr or 'unknown'
    if not check_rate_limit(client_ip):
        return jsonify({
            "success": False,
            "message": "AI request rate limit exceeded (35 requests/minute). Please slow down."
        }), 429

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint disclosing configuration status without leaking keys"""
    return jsonify({
        "status": "healthy",
        "service": "CodeCraft AI Microservice",
        "provider": Config.AI_PROVIDER,
        "model": Config.GEMINI_MODEL,
        "configured": Config.is_configured(),
        "credentialStatus": "active" if Config.is_configured() else "missing"
    }), 200

@app.route('/ai/chat', methods=['POST'])
def handle_chat():
    """POST /ai/chat: AI Learning Assistant conversation"""
    try:
        body = request.get_json(silent=True) or {}
        message = body.get('message', '').strip()
        history = body.get('history', [])

        if not message:
            return jsonify({
                "success": False,
                "message": "The 'message' field is required and cannot be empty."
            }), 400

        result = GeminiService.chat(message=message, history=history)
        return jsonify({
            "success": True,
            "data": result
        }), 200

    except ValueError as ve:
        return jsonify({"success": False, "message": str(ve)}), 400
    except Exception as ex:
        logger.error(f"Chat error: {str(ex)}")
        return jsonify({
            "success": False,
            "message": f"AI service error: {GeminiService.redact_key(str(ex))}"
        }), 502

@app.route('/ai/study-plan', methods=['POST'])
def handle_study_plan():
    """POST /ai/study-plan: Personalized Study Plan Generator"""
    try:
        body = request.get_json(silent=True) or {}
        subject = body.get('subject', '').strip()
        skill_level = body.get('skillLevel', 'Beginner').strip()
        goal = body.get('goal', '').strip()
        study_time = body.get('studyTime', '1-2 hours per day').strip()
        duration = body.get('duration', '30 Days').strip()

        if not subject or not goal:
            return jsonify({
                "success": False,
                "message": "Both 'subject' and 'goal' fields are required."
            }), 400

        result = GeminiService.generate_study_plan(
            subject=subject,
            skill_level=skill_level,
            goal=goal,
            study_time=study_time,
            duration=duration
        )
        return jsonify({
            "success": True,
            "data": result
        }), 200

    except ValueError as ve:
        return jsonify({"success": False, "message": str(ve)}), 400
    except Exception as ex:
        logger.error(f"Study plan error: {str(ex)}")
        return jsonify({
            "success": False,
            "message": f"Study plan generation error: {GeminiService.redact_key(str(ex))}"
        }), 502

@app.route('/ai/course-tutor', methods=['POST'])
def handle_course_tutor():
    """POST /ai/course-tutor: Course-Aware AI Tutor"""
    try:
        body = request.get_json(silent=True) or {}
        question = body.get('question', '').strip()
        courses = body.get('courses', [])
        course_id = body.get('courseId', None)
        history = body.get('history', [])

        if not question:
            return jsonify({
                "success": False,
                "message": "The 'question' field is required."
            }), 400

        result = GeminiService.answer_course_question(
            question=question,
            courses=courses,
            course_id=course_id,
            history=history
        )
        return jsonify({
            "success": True,
            "data": result
        }), 200

    except ValueError as ve:
        return jsonify({"success": False, "message": str(ve)}), 400
    except Exception as ex:
        logger.error(f"Course tutor error: {str(ex)}")
        return jsonify({
            "success": False,
            "message": f"Course tutor error: {GeminiService.redact_key(str(ex))}"
        }), 502

@app.route('/ai/recommendations', methods=['POST'])
def handle_recommendations():
    """POST /ai/recommendations: Intelligent Course Recommendation Engine"""
    try:
        body = request.get_json(silent=True) or {}
        interests = body.get('interests', '').strip()
        current_skills = body.get('currentSkills', '').strip()
        career_goal = body.get('careerGoal', '').strip()
        courses = body.get('courses', [])

        if not interests or not career_goal:
            return jsonify({
                "success": False,
                "message": "Both 'interests' and 'careerGoal' fields are required."
            }), 400

        result = GeminiService.recommend_courses(
            interests=interests,
            current_skills=current_skills,
            career_goal=career_goal,
            courses=courses
        )
        return jsonify({
            "success": True,
            "data": result
        }), 200

    except ValueError as ve:
        return jsonify({"success": False, "message": str(ve)}), 400
    except Exception as ex:
        logger.error(f"Recommendations error: {str(ex)}")
        return jsonify({
            "success": False,
            "message": f"Recommendation error: {GeminiService.redact_key(str(ex))}"
        }), 502

if __name__ == '__main__':
    port = Config.PORT
    logger.info("================================================================")
    logger.info("   CodeCraft AI: Python/Flask Generative AI Microservice        ")
    logger.info("================================================================")
    logger.info(f"[OK] Microservice listening on http://localhost:{port}")
    logger.info(f"[OK] Provider: {Config.AI_PROVIDER.upper()} | Model: {Config.GEMINI_MODEL}")
    logger.info(f"[OK] Credentials Status: {'CONFIGURED' if Config.is_configured() else 'MISSING'}")
    logger.info("================================================================")
    app.run(host='0.0.0.0', port=port, debug=False)
