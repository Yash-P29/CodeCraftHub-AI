const { DatabaseService } = require('../database/sqlite');

const DatabaseController = {
  // Users
  async getUsers(req, res, next) {
    try {
      const users = await DatabaseService.getUsers();
      res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
      next(err);
    }
  },

  // Conversations
  async getConversations(req, res, next) {
    try {
      const { sessionId, limit } = req.query;
      const history = await DatabaseService.getConversations(sessionId, parseInt(limit, 10) || 50);
      res.status(200).json({ success: true, count: history.length, data: history });
    } catch (err) {
      next(err);
    }
  },

  async clearConversations(req, res, next) {
    try {
      const { sessionId } = req.query;
      const result = await DatabaseService.clearConversations(sessionId);
      res.status(200).json({ success: true, message: 'Conversation history cleared.', ...result });
    } catch (err) {
      next(err);
    }
  },

  // Study plans
  async getStudyPlans(req, res, next) {
    try {
      const { sessionId, limit } = req.query;
      const plans = await DatabaseService.getStudyPlans(sessionId, parseInt(limit, 10) || 20);
      res.status(200).json({ success: true, count: plans.length, data: plans });
    } catch (err) {
      next(err);
    }
  },

  async deleteStudyPlan(req, res, next) {
    try {
      const { id } = req.params;
      const result = await DatabaseService.deleteStudyPlan(id);
      res.status(200).json({ success: true, message: 'Study plan deleted.', ...result });
    } catch (err) {
      next(err);
    }
  },

  // Learning activities
  async getActivities(req, res, next) {
    try {
      const { sessionId, limit } = req.query;
      const activities = await DatabaseService.getActivities(sessionId, parseInt(limit, 10) || 50);
      res.status(200).json({ success: true, count: activities.length, data: activities });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = DatabaseController;
