import { Platform, MessageStatus } from '@prisma/client';
import { sendToplatforms } from './notification.service';
import {
  createMessage,
  getMessagesByUser,
  getAllMessages,
  countTodayMessages,
} from '../repositories/message.repository';
import { findUserById } from '../repositories/user.repository';
import HttpError from '../errors/HttpError';
import { ERROR_CODES } from '../constants/errors';

const DAILY_LIMIT = parseInt(process.env.DAILY_MESSAGE_LIMIT || '100');

export const sendMessage = async (userId: string, content: string, platforms: Platform[]) => {
  const todayCount = await countTodayMessages(userId);
  if (todayCount >= DAILY_LIMIT) {
    const err = ERROR_CODES.MESSAGE_DAILY_LIMIT_REACHED;
    throw new HttpError(err.message, err.status, err.code, { limit: DAILY_LIMIT, used: todayCount });
  }

  const user = await findUserById(userId);
  if (!user) {
    const err = ERROR_CODES.MESSAGE_USER_NOT_FOUND;
    throw new HttpError(err.message, err.status, err.code);
  }

  const results = await sendToplatforms(content, user.username, platforms);

  const deliveries = results.map((r) => ({
    platform: r.platform,
    status: r.status === 'SUCCESS' ? MessageStatus.SUCCESS : MessageStatus.FAILED,
    providerResponse: r.providerResponse,
  }));

  return createMessage(userId, content, deliveries);
};

export const getUserMessages = async (
  userId: string,
  filters: {
    status?: MessageStatus;
    platform?: Platform;
    from?: Date;
    to?: Date;
  }
) => {
  return getMessagesByUser(userId, filters);
};

export const getAdminMetrics = async () => {
  const messages = await getAllMessages();

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const metricsMap: Record<string, { username: string; total: number; todayCount: number }> = {};

  type MessageWithUser = { user: { username: string }; userId: string; createdAt: Date };

  for (const msg of messages) {
    const uid = msg.userId;
    if (!metricsMap[uid]) {
      const m = msg as unknown as MessageWithUser;
      metricsMap[uid] = { username: m.user.username, total: 0, todayCount: 0 };
    }
    metricsMap[uid].total++;
    if (msg.createdAt >= start) metricsMap[uid].todayCount++;
  }

  return Object.entries(metricsMap).map(([userId, data]) => ({
    userId,
    username: data.username,
    totalMessages: data.total,
    remainingToday: Math.max(0, DAILY_LIMIT - data.todayCount),
  }));
};
