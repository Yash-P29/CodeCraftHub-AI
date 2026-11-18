const app = require('./src/app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('================================================================');
  console.log('   CodeCraftHub: Your Learning Management Platform — Backend    ');
  console.log('================================================================');
  console.log(`[OK] Server running on http://localhost:${PORT}`);
  console.log(`[OK] Courses API: http://localhost:${PORT}/api/courses`);
  console.log(`[OK] CodeCraft AI API: http://localhost:${PORT}/api/ai/health`);
  console.log(`[OK] Frontend Dashboard: http://localhost:${PORT}/`);
  console.log('================================================================');
});

// Handle graceful termination
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server.');
  server.close(() => {
    console.log('HTTP server closed.');
  });
});
