import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';

const authSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const result = authSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  try {
    const user = await authService.register(result.data.username, result.data.password);
    res.status(201).json(user);
  } catch (error: unknown) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const result = authSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  try {
    const data = await authService.login(result.data.username, result.data.password);
    res.status(200).json(data);
  } catch (error: unknown) {
    next(error);
  }
};
