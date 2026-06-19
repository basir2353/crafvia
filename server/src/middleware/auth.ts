import type { NextFunction, Request, Response } from 'express'
import { prisma } from '../db/client.js'
import { syncAdminRole } from '../utils/adminAccess.js'
import { verifyAccessToken, type AccessTokenPayload } from '../utils/jwt.js'

export type AuthRequest = Request & {
  user?: AccessTokenPayload
}

export async function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    next()
    return
  }

  try {
    const token = header.slice(7)
    req.user = verifyAccessToken(token)
  } catch {
    // ignore invalid token for optional auth
  }

  next()
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }

  try {
    const token = header.slice(7)
    const payload = verifyAccessToken(token)
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) {
      res.status(401).json({ error: 'User not found' })
      return
    }
    const role = await syncAdminRole(user)
    req.user = { sub: user.id, email: user.email, plan: user.plan, role }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
