import { Request, Response, NextFunction } from 'express';
import { logger } from '../observability/logger.js';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const requestId = req.headers['x-request-id'];

  logger.error(
    {
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: statusCode,
      message: err.message,
      stack: err.stack,
    },
    'Request handler error'
  );

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}
