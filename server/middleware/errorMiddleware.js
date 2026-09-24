/**
 * 404 Not Found Middleware
 * Triggered when a request reaches the end of the route stack without matching.
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Centralized Error-Handling Middleware
 * Catches all errors passed via next(err) and formats a standard JSON response.
 */
export const errorHandler = (err, req, res, next) => {
  // If status code is still 200 (default), set to 500
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
