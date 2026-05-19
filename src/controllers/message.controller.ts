import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { Platform, MessageStatus } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as messageService from '../services/message.service';

const sendSchema = z.object({
  content: z.string().min(1),
  platforms: z.array(z.nativeEnum(Platform)).min(1),
});

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const result = sendSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
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

export const getMessages = async (req: AuthRequest, res: Response) => {
  const { status, platform, from, to } = req.query;

  const filters = {
    ...(status && { status: status as MessageStatus }),
    ...(platform && { platform: platform as Platform }),
    ...(from && { from: new Date(from as string) }),
    ...(to && { to: new Date(to as string) }),
  };

  const messages = await messageService.getUserMessages(req.user!.userId, filters);
  res.json(messages);
};

export const getMetrics = async (req: AuthRequest, res: Response) => {
  const metrics = await messageService.getAdminMetrics();
  res.json(metrics);
};
