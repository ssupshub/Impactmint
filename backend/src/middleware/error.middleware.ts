import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import config from '../config/env';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    user: req.user?._id,
  });

  // Default error
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: Record<string, string> | undefined;

  // Handle AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;

    if (err instanceof ValidationError) {
      errors = err.errors;
    }
  }

  // Handle Mongoose errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    errors = {};

    // Parse Mongoose validation errors
    const mongooseErr = err as any;
    for (const field in mongooseErr.errors) {
      errors[field] = mongooseErr.errors[field].message;
    }
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  if ((err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
    const field = Object.keys((err as any).keyPattern)[0];
    errors = { [field]: `${field} already exists` };
  }

  // Send response
  const response: any = {
    success: false,
    error: message,
  };

  if (errors) {
    response.errors = errors;
  }

  // Include stack trace in development
  if (config.nodeEnv === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// Not found handler
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
};
