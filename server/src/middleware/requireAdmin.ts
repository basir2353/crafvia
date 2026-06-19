import type { NextFunction, Response } from 'express'
import { requireAuth, type AuthRequest } from './auth.js'

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (res.headersSent) return
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' })
      return
    }
    next()
  })
}
