const { CourseModel } = require('../models/courseModel');

/**
 * Controller handling Course CRUD operations
 */
const CourseController = {
  /**
   * GET /api/courses
   * Retrieve all courses with optional filtering and search
   */
  getAllCourses: (req, res, next) => {
    try {
      const { status, category, search } = req.query;
      const courses = CourseModel.getAll({ status, category, search });
      return res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/courses/:id
   * Retrieve a specific course by ID
   */
  getCourseById: (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id || id.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'A valid course ID parameter is required.'
        });
      }

      const course = CourseModel.getById(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: `Course with ID '${id}' was not found.`
        });
      }

      return res.status(200).json({
        success: true,
        data: course
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/courses
   * Create a new course
   */
  createCourse: (req, res, next) => {
    try {
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Request body must be a valid JSON object.'
        });
      }

      const newCourse = CourseModel.create(req.body);
      return res.status(201).json({
        success: true,
        message: 'Course created successfully.',
        data: newCourse
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/courses/:id
   * Update an existing course
   */
  updateCourse: (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id || id.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Course ID parameter is required.'
        });
      }

      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Request body must be a valid JSON object.'
        });
      }

      const updated = CourseModel.update(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Course updated successfully.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/courses/:id
   * Delete an existing course
   */
  deleteCourse: (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id || id.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Course ID parameter is required.'
        });
      }

      const deleted = CourseModel.delete(id);
      return res.status(200).json({
        success: true,
        message: `Course '${deleted.title}' (ID: ${deleted.id}) deleted successfully.`,
        data: deleted
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/courses/reset
   * Reset courses to original demonstration seed data
   */
  resetCourses: (req, res, next) => {
    try {
      const courses = CourseModel.resetToDefault();
      return res.status(200).json({
        success: true,
        message: 'Course catalog reset to initial demonstration state.',
        count: courses.length,
        data: courses
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = CourseController;
