// utils/AppError.js
export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // flag to distinguish known errors
    Error.captureStackTrace(this, this.constructor);
  }
}