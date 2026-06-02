import { z } from 'zod';
import { Platform, MessageStatus } from '@prisma/client';
import type { Message, MessageDelivery } from '@prisma/client';

// ── Request ──────────────────────────────────────────────────────────────────

export const sendMessageRequestSchema = z.object({
  content: z.string().min(1),
  platforms: z.array(z.nativeEnum(Platform)).min(1),
});

export type SendMessageRequestDto = z.infer<typeof sendMessageRequestSchema>;

export const messageFiltersSchema = z.object({
  status:   z.nativeEnum(MessageStatus).optional(),
  platform: z.nativeEnum(Platform).optional(),
  from:     z.coerce.date().optional(),
  to:       z.coerce.date().optional(),
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(20),
});

export type MessageFiltersDto = z.infer<typeof messageFiltersSchema>;

// ── Response ─────────────────────────────────────────────────────────────────

export interface DeliveryResponseDto {
  id: string;
  platform: Platform;
  status: MessageStatus;
  providerResponse: string | null;
  createdAt: Date;
}

export interface MessageResponseDto {
  id: string;
  content: string;
  createdAt: Date;
  deliveries: DeliveryResponseDto[];
}

export interface MetricResponseDto {
  userId: string;
  username: string;
  totalMessages: number;
  remainingToday: number;
}

export interface PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponseDto<T> {
  data: T[];
  pagination: PaginationMetaDto;
}

// ── Mappers ──────────────────────────────────────────────────────────────────

type MessageWithDeliveries = Message & { deliveries: MessageDelivery[] };

export const toDeliveryResponse = (delivery: MessageDelivery): DeliveryResponseDto => ({
  id: delivery.id,
  platform: delivery.platform,
  status: delivery.status,
  providerResponse: delivery.providerResponse ?? null,
  createdAt: delivery.createdAt,
});

export const toMessageResponse = (message: MessageWithDeliveries): MessageResponseDto => ({
  id: message.id,
  content: message.content,
  createdAt: message.createdAt,
  deliveries: message.deliveries.map(toDeliveryResponse),
});
