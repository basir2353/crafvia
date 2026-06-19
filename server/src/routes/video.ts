import { Router } from 'express'
import { env } from '../config/env.js'
import { optionalAuth, type AuthRequest } from '../middleware/auth.js'
import { compressRateLimit } from '../middleware/rateLimit.js'
import { recordJob } from '../services/usageService.js'
import { recordVideoConvertJobSchema } from '../validators/video.js'

export const videoRouter = Router()

videoRouter.use(compressRateLimit)
videoRouter.use(optionalAuth)

videoRouter.get('/convert/limits', (req, res) => {
  const plan = (req as AuthRequest).user?.plan ?? 'FREE'
  res.json({
    plan,
    maxFileMb: plan === 'PRO' ? 500 : 100,
    dailyJobs: plan === 'PRO' ? env.PRO_DAILY_JOBS : env.FREE_DAILY_JOBS,
    clientSideProcessing: true,
  })
})

videoRouter.post('/convert/complete', async (req, res, next) => {
  try {
    const authReq = req as AuthRequest
    const parsed = recordVideoConvertJobSchema.safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid job metadata' })
      return
    }

    await recordJob({
      userId: authReq.user?.sub,
      toolSlug: 'video-to-mp3',
      originalSize: parsed.data.originalSize,
      compressedSize: parsed.data.outputSize,
      status: 'COMPLETED',
    })

    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})
