import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { authRequestSchema } from '../dtos/auth.dto';
import HttpError from '../errors/HttpError';
import { ERROR_CODES } from '../constants/errors';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const result = authRequestSchema.safeParse(req.body);
  if (!result.success) {
    const err = ERROR_CODES.VALIDATION_ERROR;
    return next(new HttpError(err.message, err.status, err.code, result.error.flatten()));
  }

  try {
    const user = await authService.register(result.data.username, result.data.password);
    res.status(201).json(user);
  } catch (error: unknown) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const result = authRequestSchema.safeParse(req.body);
  if (!result.success) {
    const err = ERROR_CODES.VALIDATION_ERROR;
    return next(new HttpError(err.message, err.status, err.code, result.error.flatten()));
  }

  try {
    const data = await authService.login(result.data.username, result.data.password);
    res.status(200).json(data);
  } catch (error: unknown) {
    next(error);
  }
};
