import { Prisma } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export class AppError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
    return
  }

  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message })
    return
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2021') {
      res.status(503).json({
        error: 'Database tables are missing. Restart the server or run npm run db:setup in the server folder.',
      })
      return
    }
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'A record with this value already exists.' })
      return
    }
  }

  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}
