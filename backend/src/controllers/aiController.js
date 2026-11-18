const { CourseModel } = require('../models/courseModel');
const { DatabaseService } = require('../database/sqlite');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

/**
 * Controller handling AI feature proxying, SQLite persistence and course context grounding
 */
const AIController = {
  /**
   * Helper method to call Flask AI Microservice with timeout and error capture
   */
  async callFlaskService(endpoint, body = {}, method = 'POST') {
    const url = `${AI_SERVICE_URL}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      };

      if (method === 'POST') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      clearTimeout(timeout);

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `AI Microservice Error (HTTP ${response.status})`);
        error.statusCode = response.status;
        throw error;
      }

      return data;
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        const timeoutError = new Error('AI microservice request timed out. Please try again.');
        timeoutError.statusCode = 504;
        throw timeoutError;
      }
      if (err.cause && (err.cause.code === 'ECONNREFUSED' || err.message.includes('fetch failed'))) {
        const connError = new Error('CodeCraft AI Python microservice is not reachable on port 5001. Please start the AI service with: cd backend/ai-service && python app.py');
        connError.statusCode = 503;
        throw connError;
      }
      throw err;
    }
  },

  /**
   * GET /api/ai/health
   * Note: Completely excludes any masked key fragments per security requirement.
   */
  async getHealth(req, res) {
    try {
      const flaskHealth = await AIController.callFlaskService('/health', {}, 'GET');
      return res.status(200).json({
        status: 'healthy',
        aiService: {
          online: true,
          provider: flaskHealth.provider || 'gemini',
          model: flaskHealth.model || 'gemini-3.5-flash-lite',
          configured: flaskHealth.configured,
          credentialStatus: flaskHealth.credentialStatus
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      return res.status(200).json({
        status: 'degraded',
        aiService: {
          online: false,
          error: err.message,
          configured: false
        },
        timestamp: new Date().toISOString()
      });
    }
  },

  /**
   * POST /api/ai/chat
   * Feature 1: AI Learning Assistant with SQLite persistence
   */
  async chat(req, res, next) {
    try {
      const { message, history, sessionId = 'default-session' } = req.body || {};

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'The "message" field is required and cannot be empty.'
        });
      }

      const result = await AIController.callFlaskService('/ai/chat', {
        message: message.trim(),
        history: Array.isArray(history) ? history : []
      });

      // Persist conversation and log activity asynchronously in SQLite
      try {
        await DatabaseService.saveConversation(
          sessionId,
          message.trim(),
          result.data.response,
          result.data.model || 'gemini'
        );
        await DatabaseService.logActivity(
          sessionId,
          'ai_chat',
          `Asked AI Assistant: "${message.trim().slice(0, 70)}..."`
        );
      } catch (dbErr) {
        console.warn('[SQLite] Notice: failed to persist chat record:', dbErr.message);
      }

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/ai/study-plan
   * Feature 2: Personalized Study Plan Generator with SQLite persistence
   */
  async generateStudyPlan(req, res, next) {
    try {
      const { subject, skillLevel, goal, studyTime, duration, sessionId = 'default-session' } = req.body || {};

      if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'The "subject" field is required.'
        });
      }

      if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'The "goal" field is required.'
        });
      }

      const result = await AIController.callFlaskService('/ai/study-plan', {
        subject: subject.trim(),
        skillLevel: skillLevel || 'Beginner',
        goal: goal.trim(),
        studyTime: studyTime || '1-2 hours per day',
        duration: duration || '30 Days'
      });

      // Persist plan and log activity in SQLite
      try {
        await DatabaseService.saveStudyPlan(
          sessionId,
          {
            subject: subject.trim(),
            skillLevel: skillLevel || 'Beginner',
            goal: goal.trim(),
            studyTime: studyTime || '1-2 hours per day',
            duration: duration || '30 Days'
          },
          result.data.plan
        );
        await DatabaseService.logActivity(
          sessionId,
          'study_plan_generation',
          `Generated study roadmap for: "${subject.trim()}"`
        );
      } catch (dbErr) {
        console.warn('[SQLite] Notice: failed to persist study plan:', dbErr.message);
      }

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/ai/course-tutor
   * Feature 3: Course-Aware AI Tutor (grounds with actual courses in JSON storage)
   */
  async courseTutor(req, res, next) {
    try {
      const { question, courseId, history, sessionId = 'default-session' } = req.body || {};

      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'The "question" field is required.'
        });
      }

      // Inject actual course catalog from JSON storage
      const allCourses = CourseModel.readAll();

      const result = await AIController.callFlaskService('/ai/course-tutor', {
        question: question.trim(),
        courseId: courseId || null,
        courses: allCourses,
        history: Array.isArray(history) ? history : []
      });

      // Log activity in SQLite
      try {
        await DatabaseService.logActivity(
          sessionId,
          'course_tutor',
          `Consulted Course Tutor on: "${question.trim().slice(0, 70)}..."`
        );
      } catch (dbErr) {
        console.warn('[SQLite] Activity log warning:', dbErr.message);
      }

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/ai/recommendations
   * Feature 4: Intelligent Course Recommendations (grounds with real courses in JSON)
   */
  async getRecommendations(req, res, next) {
    try {
      const { interests, currentSkills, careerGoal, sessionId = 'default-session' } = req.body || {};

      if (!interests || typeof interests !== 'string' || interests.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'The "interests" field is required.'
        });
      }

      if (!careerGoal || typeof careerGoal !== 'string' || careerGoal.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'The "careerGoal" field is required.'
        });
      }

      // Inject live course catalog
      const allCourses = CourseModel.readAll();

      const result = await AIController.callFlaskService('/ai/recommendations', {
        interests: interests.trim(),
        currentSkills: currentSkills || 'Beginner',
        careerGoal: careerGoal.trim(),
        courses: allCourses
      });

      // Log activity in SQLite
      try {
        await DatabaseService.logActivity(
          sessionId,
          'course_recommendation',
          `Requested course recommendations for: "${careerGoal.trim().slice(0, 70)}..."`
        );
      } catch (dbErr) {
        console.warn('[SQLite] Activity log warning:', dbErr.message);
      }

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AIController;
