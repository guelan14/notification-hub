import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import HttpError from '../errors/HttpError';
import { ERROR_CODES } from '../constants/errors';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: Role;
  };
}

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = ERROR_CODES.AUTH_UNAUTHORIZED;
    return next(new HttpError(err.message, err.status, err.code));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: Role };
    req.user = payload;
    next();
  } catch {
    const err = ERROR_CODES.AUTH_UNAUTHORIZED;
    next(new HttpError(err.message, err.status, err.code));
  }
};

