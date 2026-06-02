import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as messageService from '../services/message.service';
import { sendMessageRequestSchema, messageFiltersSchema } from '../dtos/message.dto';
import HttpError from '../errors/HttpError';
import { ERROR_CODES } from '../constants/errors';

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const result = sendMessageRequestSchema.safeParse(req.body);
  if (!result.success) {
    const err = ERROR_CODES.VALIDATION_ERROR;
    return next(new HttpError(err.message, err.status, err.code, result.error.flatten()));
  }

  try {
    const message = await messageService.sendMessage(
      req.user!.userId,
      result.data.content,
      result.data.platforms
    );
    res.status(201).json(message);
  } catch (error: unknown) {
    next(error);
  }
};

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const result = messageFiltersSchema.safeParse(req.query);
  if (!result.success) {
    const err = ERROR_CODES.VALIDATION_ERROR;
    return next(new HttpError(err.message, err.status, err.code, result.error.flatten()));
  }

  try {
    const messages = await messageService.getUserMessages(req.user!.userId, result.data);
    res.json(messages);
  } catch (error: unknown) {
    next(error);
  }
};

export const getMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const metrics = await messageService.getAdminMetrics();
    res.json(metrics);
  } catch (error: unknown) {
    next(error);
  }
};
