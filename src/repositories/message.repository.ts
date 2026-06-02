import prisma from '../config/prisma';
import { Platform, MessageStatus } from '@prisma/client';

export const createMessage = async (
  userId: string,
  content: string,
  deliveries: { platform: Platform; status: MessageStatus; providerResponse: string }[]
) => {
  return prisma.message.create({
    data: {
      userId,
      content,
      deliveries: {
        create: deliveries.map((d) => ({
          platform: d.platform,
          status: d.status,
          providerResponse: d.providerResponse,
        })),
      },
    },
    include: { deliveries: true },
  });
};

export const getMessagesByUser = async (
  userId: string,
  filters: {
    status?: MessageStatus;
    platform?: Platform;
    from?: Date;
    to?: Date;
    page: number;
    limit: number;
  }
) => {
  const where = {
    userId,
    deliveries: {
      some: {
        ...(filters.status && { status: filters.status }),
        ...(filters.platform && { platform: filters.platform }),
      },
    },
    ...(filters.from || filters.to
      ? {
          createdAt: {
            ...(filters.from && { gte: filters.from }),
            ...(filters.to && { lte: filters.to }),
          },
        }
      : {}),
  };

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      include: { deliveries: true },
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.message.count({ where }),
  ]);

  return { messages, total };
};

export const getAllMessages = async () => {
  return prisma.message.findMany({
    include: { deliveries: true, user: { select: { username: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const getMessageCountsGroupedByUser = async () => {
  return prisma.message.groupBy({
    by: ['userId'],
    _count: { id: true },
  });
};

export const getTodayMessageCountsGroupedByUser = async (since: Date) => {
  return prisma.message.groupBy({
    by: ['userId'],
    _count: { id: true },
    where: { createdAt: { gte: since } },
  });
};

export const countTodayMessages = async (userId: string): Promise<number> => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return prisma.message.count({
    where: {
      userId,
      createdAt: { gte: start, lte: end },
    },
  });
};
