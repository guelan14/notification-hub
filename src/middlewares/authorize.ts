import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { getAllRolePermissions } from '../repositories/permission.repository';
import HttpError from '../errors/HttpError';
import { ERROR_CODES } from '../constants/errors';

// Cache cargado una vez desde BD. Se invalida llamando clearPermissionsCache().
let permissionsCache: Map<string, Set<string>> | null = null;

const loadPermissions = async (): Promise<Map<string, Set<string>>> => {
  if (permissionsCache) return permissionsCache;

  const rows = await getAllRolePermissions();
  const cache = new Map<string, Set<string>>();

  for (const row of rows) {
    if (!cache.has(row.role)) cache.set(row.role, new Set());
    cache.get(row.role)!.add(row.permission.name);
  }

  permissionsCache = cache;
  return permissionsCache;
};

export const clearPermissionsCache = () => {
  permissionsCache = null;
};

export const authorize = (...required: string[]) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) {
      const err = ERROR_CODES.AUTH_UNAUTHORIZED;
      return next(new HttpError(err.message, err.status, err.code));
    }

    try {
      const permissions = await loadPermissions();
      const rolePerms = permissions.get(role) ?? new Set();
      const ok = required.every((r) => rolePerms.has(r));

      if (!ok) {
        const err = ERROR_CODES.AUTH_FORBIDDEN;
        return next(new HttpError(err.message, err.status, err.code));
      }

      next();
    } catch {
      next(new HttpError('Failed to load permissions', 500, 'INTERNAL_SERVER_ERROR'));
    }
  };
};

export default authorize;
