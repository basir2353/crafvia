import { Router } from 'express'
import { env } from '../config/env.js'
import { optionalAuth, type AuthRequest } from '../middleware/auth.js'
import { compressRateLimit } from '../middleware/rateLimit.js'
import { recordJob } from '../services/usageService.js'
import { recordBackgroundJobSchema } from '../validators/background.js'

export const backgroundRouter = Router()

backgroundRouter.use(compressRateLimit)
backgroundRouter.use(optionalAuth)

backgroundRouter.get('/limits', (req, res) => {
  const plan = (req as AuthRequest).user?.plan ?? 'FREE'
  res.json({
    plan,
    maxFileMb: plan === 'PRO' ? env.PRO_MAX_FILE_MB : env.FREE_MAX_FILE_MB,
    dailyJobs: plan === 'PRO' ? env.PRO_DAILY_JOBS : env.FREE_DAILY_JOBS,
    clientSideProcessing: true,
  })
})

backgroundRouter.post('/complete', async (req, res, next) => {
  try {
    const authReq = req as AuthRequest
    const parsed = recordBackgroundJobSchema.safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid job metadata' })
      return
    }

    await recordJob({
      userId: authReq.user?.sub,
      toolSlug: 'remove-background',
      originalSize: parsed.data.originalSize,
      compressedSize: parsed.data.outputSize,
      status: 'COMPLETED',
    })

    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})
