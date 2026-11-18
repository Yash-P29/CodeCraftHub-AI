/**
 * CodeCraftHub API Client
 * Centralized service layer for communicating with the Node.js/Express REST API
 */
const API_BASE = (() => {
  // If served directly by backend or reverse proxy
  if (window.location.protocol.startsWith('http') && window.location.port === '5000') {
    return '/api/courses';
  }
  // If served from Live Server, file://, or another static server
  return 'http://localhost:5000/api/courses';
})();

const HEALTH_BASE = (() => {
  if (window.location.protocol.startsWith('http') && window.location.port === '5000') {
    return '/api/health';
  }
  return 'http://localhost:5000/api/health';
})();

class CourseAPI {
  /**
   * Helper method for performing fetch requests with timeout and error extraction
   */
  static async request(url, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data.message || `HTTP Error ${response.status}: ${response.statusText}`;
        const error = new Error(errorMsg);
        error.status = response.status;
        error.details = data.details || [];
        throw error;
      }

      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to CodeCraftHub backend server. Please make sure the backend is running on http://localhost:5000.');
      }
      throw err;
    }
  }

  /**
   * Check backend health and connectivity
   */
  static async checkHealth() {
    try {
      const res = await fetch(HEALTH_BASE, { method: 'GET' });
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * GET /api/courses
   * Retrieve all courses with optional filters
   */
  static async getAll(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await this.request(`${API_BASE}${queryString}`, { method: 'GET' });
    return res.data || [];
  }

  /**
   * GET /api/courses/:id
   * Retrieve single course by ID
   */
  static async getById(id) {
    const res = await this.request(`${API_BASE}/${encodeURIComponent(id)}`, { method: 'GET' });
    return res.data;
  }

  /**
   * POST /api/courses
   * Create a new course
   */
  static async create(courseData) {
    const res = await this.request(API_BASE, {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
    return res.data;
  }

  /**
   * PUT /api/courses/:id
   * Update an existing course
   */
  static async update(id, courseData) {
    const res = await this.request(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    });
    return res.data;
  }

  /**
   * DELETE /api/courses/:id
   * Delete course by ID
   */
  static async delete(id) {
    const res = await this.request(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.data;
  }

  /**
   * POST /api/courses/reset
   * Reset courses to demonstration seed dataset
   */
  static async resetDemoData() {
    const res = await this.request(`${API_BASE}/reset`, { method: 'POST' });
    return res.data;
  }
}

const AI_BASE = (() => {
  if (window.location.protocol.startsWith('http') && window.location.port === '5000') {
    return '/api/ai';
  }
  return 'http://localhost:5000/api/ai';
})();

class AIApi {
  /**
   * GET /api/ai/health
   */
  static async checkHealth() {
    try {
      const res = await CourseAPI.request(`${AI_BASE}/health`, { method: 'GET' });
      return res;
    } catch {
      return { status: 'offline', aiService: { online: false } };
    }
  }

  /**
   * POST /api/ai/chat
   * Feature 1: AI Learning Assistant
   */
  static async sendChatMessage(message, history = []) {
    const res = await CourseAPI.request(`${AI_BASE}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, history })
    });
    return res.data;
  }

  /**
   * POST /api/ai/study-plan
   * Feature 2: Personalized Study Plan Generator
   */
  static async generateStudyPlan(planParams) {
    const res = await CourseAPI.request(`${AI_BASE}/study-plan`, {
      method: 'POST',
      body: JSON.stringify(planParams)
    });
    return res.data;
  }

  /**
   * POST /api/ai/course-tutor
   * Feature 3: Course-Aware AI Tutor
   */
  static async askCourseTutor(question, courseId = null, history = []) {
    const res = await CourseAPI.request(`${AI_BASE}/course-tutor`, {
      method: 'POST',
      body: JSON.stringify({ question, courseId, history })
    });
    return res.data;
  }

  /**
   * POST /api/ai/recommendations
   * Feature 4: Intelligent Course Recommendation Engine
   */
  static async getRecommendations(profileParams) {
    const res = await CourseAPI.request(`${AI_BASE}/recommendations`, {
      method: 'POST',
      body: JSON.stringify(profileParams)
    });
    return res.data;
  }
}

// Export to window
window.CourseAPI = CourseAPI;
window.AIApi = AIApi;
