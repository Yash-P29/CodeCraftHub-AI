/**
 * CodeCraftHub API Service
 * Centralized client for communicating with Node.js/Express REST API
 */

const API_BASE = '/api/courses';
const HEALTH_BASE = '/api/health';

export const courseApi = {
  /**
   * Helper request handler
   */
  async request(url, options = {}) {
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
        throw new Error('Unable to connect to CodeCraftHub backend server. Please verify the server is running.');
      }
      throw err;
    }
  },

  /**
   * Check backend health and connectivity
   */
  async checkHealth() {
    try {
      const res = await fetch(HEALTH_BASE, { method: 'GET' });
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * GET /api/courses
   * Retrieve all courses with optional filters
   */
  async getAll(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await this.request(`${API_BASE}${queryString}`, { method: 'GET' });
    return res.data || [];
  },

  /**
   * GET /api/courses/:id
   * Retrieve single course by ID
   */
  async getById(id) {
    const res = await this.request(`${API_BASE}/${encodeURIComponent(id)}`, { method: 'GET' });
    return res.data;
  },

  /**
   * POST /api/courses
   * Create a new course
   */
  async create(courseData) {
    const res = await this.request(API_BASE, {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
    return res.data;
  },

  /**
   * PUT /api/courses/:id
   * Update an existing course
   */
  async update(id, courseData) {
    const res = await this.request(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    });
    return res.data;
  },

  /**
   * DELETE /api/courses/:id
   * Delete course by ID
   */
  async delete(id) {
    const res = await this.request(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.data;
  },

  /**
   * POST /api/courses/reset
   * Reset courses to demonstration seed dataset
   */
  async resetDemoData() {
    const res = await this.request(`${API_BASE}/reset`, { method: 'POST' });
    return res.data;
  }
};
