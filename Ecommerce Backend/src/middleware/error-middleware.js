import { validationResult } from 'express-validator';
import Logger from "../lib/logger.js";


// Middleware to handle validation errors
export function handleValidation(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  Logger.error("Error caught by error handler:", {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
  });

  // Send error response
  res.status(err.statusCode || 500).json({
    message: err.message || "Server Error",
  });
};