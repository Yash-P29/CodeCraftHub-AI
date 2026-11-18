const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'codecraft.db');

// Ensure data folder exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('[SQLite] Failed to connect to database:', err.message);
  } else {
    console.log('[SQLite] Connected to relational database at backend/data/codecraft.db');
  }
});

// Initialize schema
db.serialize(() => {
  // 1. users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. ai_conversations table
  db.run(`
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      user_message TEXT NOT NULL,
      ai_response TEXT NOT NULL,
      model TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. study_plans table
  db.run(`
    CREATE TABLE IF NOT EXISTS study_plans (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      skill_level TEXT NOT NULL,
      learning_goal TEXT NOT NULL,
      available_hours TEXT,
      duration TEXT,
      generated_plan TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4. learning_activity table
  db.run(`
    CREATE TABLE IF NOT EXISTS learning_activity (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Indexes for high-performance session lookups
  db.run(`CREATE INDEX IF NOT EXISTS idx_conversations_session ON ai_conversations(session_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_study_plans_session ON study_plans(session_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_activity_session ON learning_activity(session_id)`);

  // Seed default academic student record synchronously
  db.run(
    `INSERT OR IGNORE INTO users (id, name, email) VALUES (?, ?, ?)`,
    ['USR-101', 'Yash Patil', 'yash.patil@vit.edu']
  );
});

/**
 * Database operations wrapped in Promises using parameterized SQL queries
 */
const DatabaseService = {
  // Conversations
  async saveConversation(sessionId, userMessage, aiResponse, model = 'gemini') {
    return new Promise((resolve, reject) => {
      const id = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const sql = `
        INSERT INTO ai_conversations (id, session_id, user_message, ai_response, model)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.run(sql, [id, sessionId, userMessage, aiResponse, model], function(err) {
        if (err) return reject(err);
        resolve({ id, sessionId, userMessage, aiResponse, model });
      });
    });
  },

  async getConversations(sessionId, limit = 50) {
    return new Promise((resolve, reject) => {
      const sql = sessionId
        ? `SELECT * FROM ai_conversations WHERE session_id = ? ORDER BY created_at ASC LIMIT ?`
        : `SELECT * FROM ai_conversations ORDER BY created_at ASC LIMIT ?`;
      const params = sessionId ? [sessionId, limit] : [limit];
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  async clearConversations(sessionId) {
    return new Promise((resolve, reject) => {
      const sql = sessionId
        ? `DELETE FROM ai_conversations WHERE session_id = ?`
        : `DELETE FROM ai_conversations`;
      const params = sessionId ? [sessionId] : [];
      db.run(sql, params, function(err) {
        if (err) return reject(err);
        resolve({ deleted: this.changes });
      });
    });
  },

  // Study plans
  async saveStudyPlan(sessionId, params, generatedPlan) {
    return new Promise((resolve, reject) => {
      const id = `plan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const sql = `
        INSERT INTO study_plans (id, session_id, subject, skill_level, learning_goal, available_hours, duration, generated_plan)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.run(
        sql,
        [
          id,
          sessionId,
          params.subject,
          params.skillLevel || 'Beginner',
          params.goal,
          params.studyTime || '2 hours per day',
          params.duration || '30 Days',
          generatedPlan
        ],
        function(err) {
          if (err) return reject(err);
          resolve({ id, sessionId, ...params, generatedPlan });
        }
      );
    });
  },

  async getStudyPlans(sessionId, limit = 20) {
    return new Promise((resolve, reject) => {
      const sql = sessionId
        ? `SELECT * FROM study_plans WHERE session_id = ? ORDER BY created_at DESC LIMIT ?`
        : `SELECT * FROM study_plans ORDER BY created_at DESC LIMIT ?`;
      const params = sessionId ? [sessionId, limit] : [limit];
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  async deleteStudyPlan(id) {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM study_plans WHERE id = ?`, [id], function(err) {
        if (err) return reject(err);
        resolve({ deleted: this.changes });
      });
    });
  },

  // Learning Activity Logger
  async logActivity(sessionId, activityType, description) {
    return new Promise((resolve, reject) => {
      const id = `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const sql = `
        INSERT INTO learning_activity (id, session_id, activity_type, description)
        VALUES (?, ?, ?, ?)
      `;
      db.run(sql, [id, sessionId || 'default-session', activityType, description], function(err) {
        if (err) return reject(err);
        resolve({ id, sessionId, activityType, description });
      });
    });
  },

  async getActivities(sessionId, limit = 50) {
    return new Promise((resolve, reject) => {
      const sql = sessionId
        ? `SELECT * FROM learning_activity WHERE session_id = ? ORDER BY created_at DESC LIMIT ?`
        : `SELECT * FROM learning_activity ORDER BY created_at DESC LIMIT ?`;
      const params = sessionId ? [sessionId, limit] : [limit];
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  // Users
  async getUsers() {
    return new Promise((resolve, reject) => {
      db.all(`SELECT id, name, email, created_at FROM users ORDER BY created_at ASC`, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
};

module.exports = {
  db,
  DatabaseService
};
