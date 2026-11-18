const express = require('express');
const router = express.Router();
const DatabaseController = require('../controllers/databaseController');

// Users
router.get('/users', DatabaseController.getUsers);

// Conversations
router.get('/conversations', DatabaseController.getConversations);
router.delete('/conversations', DatabaseController.clearConversations);

// Study Plans
router.get('/study-plans', DatabaseController.getStudyPlans);
router.delete('/study-plans/:id', DatabaseController.deleteStudyPlan);

// Activities
router.get('/activities', DatabaseController.getActivities);

module.exports = router;
