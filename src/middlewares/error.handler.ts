import { Request, Response, NextFunction } from 'express';
import HttpError from '../errors/HttpError';
import logger from '../utils/logger';
import { ERROR_CODES } from '../constants/errors';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  void _next;
  // Prisma error detection (KnownRequestError, InitializationError, etc.)
  if (err && typeof err === 'object' && 'name' in err && typeof err.name === 'string' && err.name.startsWith('Prisma')) {
    logger.error(err);
    const dbErr = ERROR_CODES.DB_CONNECTION_ERROR;
    const payload: Record<string, unknown> = { error: dbErr.message, code: dbErr.code };
    if (process.env.NODE_ENV !== 'production') payload.stack = (err as Error).stack;
    res.status(dbErr.status).json(payload);
    return;
  }

  if (err instanceof HttpError) {
    logger.error(err);
    const payload: Record<string, unknown> = { error: err.message, code: err.code };
    if (err.details && process.env.NODE_ENV !== 'production') payload.details = err.details;
    if (process.env.NODE_ENV !== 'production') payload.stack = (err as Error).stack;
    res.status(err.status).json(payload);
    return;
  }

  if (err instanceof Error) {
    logger.error(err);
    const generic = ERROR_CODES.INTERNAL_SERVER_ERROR;
    const payload: Record<string, unknown> = { error: generic.message, code: generic.code };
    if (process.env.NODE_ENV !== 'production') {
      payload.stack = err.stack;
      payload.original = err.message;
    }
    res.status(generic.status).json(payload);
    return;
  }

  logger.error(String(err));
  const generic = ERROR_CODES.INTERNAL_SERVER_ERROR;
  res.status(generic.status).json({ error: generic.message, code: generic.code });
};

export default errorHandler;
