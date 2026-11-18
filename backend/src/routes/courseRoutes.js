const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/courseController');

// Course CRUD routes
router.get('/', CourseController.getAllCourses);
router.post('/', CourseController.createCourse);
router.post('/reset', CourseController.resetCourses);
router.get('/:id', CourseController.getCourseById);
router.put('/:id', CourseController.updateCourse);
router.delete('/:id', CourseController.deleteCourse);

module.exports = router;
