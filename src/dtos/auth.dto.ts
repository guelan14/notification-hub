import { z } from 'zod';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';

// ── Request ──────────────────────────────────────────────────────────────────

export const authRequestSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export type AuthRequestDto = z.infer<typeof authRequestSchema>;

// ── Response ─────────────────────────────────────────────────────────────────

export interface AuthUserResponseDto {
  id: string;
  username: string;
  role: Role;
}

export interface TokenResponseDto {
  token: string;
}

// ── Mappers ──────────────────────────────────────────────────────────────────

export const toAuthUserResponse = (
  user: Pick<User, 'id' | 'username' | 'role'>
): AuthUserResponseDto => ({
  id: user.id,
  username: user.username,
  role: user.role,
});
