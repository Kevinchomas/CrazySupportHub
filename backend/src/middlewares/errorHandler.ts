import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export const errorHandler = (
  err: AppError | ZodError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
      },
    });
    return;
  }

  const appErr = err as AppError;
  const statusCode = appErr.statusCode || 500;
  const errorCode = appErr.code || (statusCode === 401 ? 'UNAUTHORIZED' : statusCode === 403 ? 'FORBIDDEN' : statusCode === 404 ? 'NOT_FOUND' : statusCode === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR');
  const message = appErr.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: message,
    },
  });
};


