const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const courseRoutes = require('./routes/courseRoutes');
const aiRoutes = require('./routes/aiRoutes');
const databaseRoutes = require('./routes/databaseRoutes');
const errorHandler = require('./middleware/errorHandler');
const { CourseModel } = require('./models/courseModel');
const { db } = require('./database/sqlite');

const app = express();

// Configure CORS - allow all origins for local academic demonstration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware for live demo terminal transparency
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Serve frontend static assets (Vite React dist if built, otherwise frontend directory)
const reactDistPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
const legacyFrontendPath = path.join(__dirname, '..', '..', 'frontend');
const frontendPath = fs.existsSync(reactDistPath) ? reactDistPath : legacyFrontendPath;
app.use(express.static(frontendPath));

// API health endpoint
app.get('/api/health', (req, res) => {
  const courses = CourseModel.readAll();
  res.status(200).json({
    status: 'healthy',
    platform: 'CodeCraftHub Learning Management Platform',
    version: '2.0.0',
    totalCourses: courses.length,
    database: 'SQLite + JSON Hybrid Storage',
    timestamp: new Date().toISOString()
  });
});

// Mount course, AI, and SQLite database routes
app.use('/api/courses', courseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/db', databaseRoutes);

// Fallback for root and SPA routes
app.get('/', (req, res) => {
  const indexHtml = path.join(frontendPath, 'index.html');
  res.sendFile(indexHtml);
});

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' does not exist.`
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
