const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');

// AI Module Endpoints
router.get('/health', AIController.getHealth);
router.post('/chat', AIController.chat);
router.post('/study-plan', AIController.generateStudyPlan);
router.post('/course-tutor', AIController.courseTutor);
router.post('/recommendations', AIController.getRecommendations);

module.exports = router;
