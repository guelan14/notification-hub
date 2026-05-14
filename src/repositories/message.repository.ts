import prisma from '../config/prisma'
import { Platform, MessageStatus } from '@prisma/client'

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
          providerResponse: d.providerResponse
        }))
      }
    },
    include: { deliveries: true }
  })
}

export const getMessagesByUser = async (
  userId: string,
  filters: {
    status?: MessageStatus
    platform?: Platform
    from?: Date
    to?: Date
  }
) => {
  return prisma.message.findMany({
    where: {
      userId,
      deliveries: {
        some: {
          ...(filters.status && { status: filters.status }),
          ...(filters.platform && { platform: filters.platform })
        }
      },
      ...(filters.from || filters.to
        ? {
            createdAt: {
              ...(filters.from && { gte: filters.from }),
              ...(filters.to && { lte: filters.to })
            }
          }
        : {})
    },
    include: { deliveries: true },
    orderBy: { createdAt: 'desc' }
  })
}

export const getAllMessages = async () => {
  return prisma.message.findMany({
    include: { deliveries: true, user: { select: { username: true } } },
    orderBy: { createdAt: 'desc' }
  })
}

export const countTodayMessages = async (userId: string): Promise<number> => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)

  return prisma.message.count({
    where: {
      userId,
      createdAt: { gte: start, lte: end }
    }
  })
}