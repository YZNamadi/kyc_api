import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import { AppError } from '../utils/errorHandler';

export const authorize = (roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('User not authorized', 403);
    }

    next();
  };
}; 