/**
 * Global Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  // Log error in console for debugging
  console.error(`[API Error] ${req.method} ${req.originalUrl} - Status: ${statusCode} - ${err.message}`);

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    details: err.details || undefined,
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;
