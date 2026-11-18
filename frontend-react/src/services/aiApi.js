/**
 * CodeCraft AI Service
 * Client for communicating with the AI proxy endpoints on Node.js/Express
 */

const AI_BASE = '/api/ai';

export const aiApi = {
  /**
   * GET /api/ai/health
   */
  async checkHealth() {
    try {
      const response = await fetch(`${AI_BASE}/health`);
      if (!response.ok) return { status: 'offline', aiService: { online: false } };
      return await response.json();
    } catch {
      return { status: 'offline', aiService: { online: false } };
    }
  },

  /**
   * Helper request
   */
  async request(url, payload) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `HTTP Error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      throw error;
    }

    return data.data;
  },

  /**
   * POST /api/ai/chat
   * Feature 1: AI Learning Assistant
   */
  async sendChatMessage(message, history = [], sessionId = null) {
    return await this.request(`${AI_BASE}/chat`, {
      message,
      history,
      sessionId
    });
  },

  /**
   * POST /api/ai/study-plan
   * Feature 2: Personalized Study Plan Generator
   */
  async generateStudyPlan(planParams, sessionId = null) {
    return await this.request(`${AI_BASE}/study-plan`, {
      ...planParams,
      sessionId
    });
  },

  /**
   * POST /api/ai/course-tutor
   * Feature 3: Course-Aware AI Tutor
   */
  async askCourseTutor(question, courseId = null, history = [], sessionId = null) {
    return await this.request(`${AI_BASE}/course-tutor`, {
      question,
      courseId,
      history,
      sessionId
    });
  },

  /**
   * POST /api/ai/recommendations
   * Feature 4: Intelligent Course Recommendation Engine
   */
  async getRecommendations(profileParams, sessionId = null) {
    return await this.request(`${AI_BASE}/recommendations`, {
      ...profileParams,
      sessionId
    });
  }
};
