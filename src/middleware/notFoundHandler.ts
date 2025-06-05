import { Request } from 'express';
import { AppError } from '../utils/errorHandler';

export const notFoundHandler = (req: Request) => {
  throw new AppError(`Route ${req.originalUrl} not found`, 404);
}; 