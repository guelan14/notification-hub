import { Platform, MessageStatus } from '@prisma/client';
import { sendToplatforms } from './notification.service';
import {
  createMessage,
  getMessagesByUser,
  countTodayMessages,
  getMessageCountsGroupedByUser,
  getTodayMessageCountsGroupedByUser,
} from '../repositories/message.repository';
import { findUserById, getAllUsers } from '../repositories/user.repository';
import HttpError from '../errors/HttpError';
import { ERROR_CODES } from '../constants/errors';
import {
  MessageResponseDto,
  MetricResponseDto,
  MessageFiltersDto,
  PaginatedResponseDto,
  toMessageResponse,
} from '../dtos/message.dto';

const DAILY_LIMIT = parseInt(process.env.DAILY_MESSAGE_LIMIT || '100');

export const sendMessage = async (
  userId: string,
  content: string,
  platforms: Platform[]
): Promise<MessageResponseDto> => {
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

  const message = await createMessage(userId, content, deliveries);
  return toMessageResponse(message);
};

export const getUserMessages = async (
  userId: string,
  filters: MessageFiltersDto
): Promise<PaginatedResponseDto<MessageResponseDto>> => {
  const { page, limit } = filters;
  const { messages, total } = await getMessagesByUser(userId, filters);

  return {
    data: messages.map(toMessageResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAdminMetrics = async (): Promise<MetricResponseDto[]> => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const [users, totalCounts, todayCounts] = await Promise.all([
    getAllUsers(),
    getMessageCountsGroupedByUser(),
    getTodayMessageCountsGroupedByUser(start),
  ]);

  const totalMap = new Map(totalCounts.map((r) => [r.userId, r._count.id]));
  const todayMap = new Map(todayCounts.map((r) => [r.userId, r._count.id]));

  return users.map((user) => ({
    userId: user.id,
    username: user.username,
    totalMessages: totalMap.get(user.id) ?? 0,
    remainingToday: Math.max(0, DAILY_LIMIT - (todayMap.get(user.id) ?? 0)),
  }));
};
