import { NextFunction, Request, Response } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.statusCode ?? 400;
  res.status(status).json({
    error: err.message || 'An unexpected error occurred',
  });
}
