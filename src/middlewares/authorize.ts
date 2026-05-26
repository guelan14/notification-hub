import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth.middleware'

// Mapeo simple role -> permisos. Expandible a DB o cache.
const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ['*'],
  USER: ['messages:create', 'messages:read']
}

// middleware factory: authorize('perm1','perm2')
export const authorize = (...required: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role
    if (!role) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const perms = ROLE_PERMISSIONS[role] ?? []
    const ok = perms.includes('*') || required.every(r => perms.includes(r))

    if (!ok) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    next()
  }
}

export default authorize
