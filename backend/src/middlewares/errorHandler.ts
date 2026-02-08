import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: any = undefined;

  // Handle ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle Prisma errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    
    // Unique constraint violation
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[])?.[0] || 'field';
      message = `${field} already exists`;
    }
    // Foreign key constraint violation
    else if (err.code === 'P2003') {
      message = 'Referenced resource not found';
    }
    // Record not found
    else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Resource not found';
    }
    else {
      message = 'Database error';
    }
  }
  // Handle Prisma validation errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 422;
    message = 'Invalid data provided';
  }
  // Handle validation errors from express-validator
  else if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation error';
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
