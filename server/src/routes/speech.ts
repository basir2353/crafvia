import { Router } from 'express'
import multer from 'multer'
import { env } from '../config/env.js'
import { optionalAuth, type AuthRequest } from '../middleware/auth.js'
import { AppError } from '../middleware/errorHandler.js'
import { compressRateLimit } from '../middleware/rateLimit.js'
import {
  isSpeechTranscriptionConfigured,
  transcribeAudioBuffer,
} from '../services/speechTranscribe.js'
import {
  assertUsageAllowed,
  getMaxFileBytes,
  recordJob,
} from '../services/usageService.js'
import { recordSpeechJobSchema } from '../validators/speech.js'

const MAX_WHISPER_BYTES = 25 * 1024 * 1024

function createUpload(plan: 'FREE' | 'PRO') {
  const planLimit = getMaxFileBytes(plan)
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: Math.min(planLimit, MAX_WHISPER_BYTES) },
  })
}

export const speechRouter = Router()

speechRouter.use(compressRateLimit)
speechRouter.use(optionalAuth)

speechRouter.get('/limits', (req, res) => {
  const plan = (req as AuthRequest).user?.plan ?? 'FREE'
  res.json({
    plan,
    maxTextLength: 5000,
    maxFileMb: Math.min(
      plan === 'PRO' ? env.PRO_MAX_FILE_MB : env.FREE_MAX_FILE_MB,
      25,
    ),
    dailyJobs: plan === 'PRO' ? env.PRO_DAILY_JOBS : env.FREE_DAILY_JOBS,
    configured: isSpeechTranscriptionConfigured(),
    clientSideProcessing: false,
  })
})

speechRouter.post('/transcribe', (req, res, next) => {
  const plan = (req as AuthRequest).user?.plan ?? 'FREE'
  const upload = createUpload(plan).single('file')

  upload(req, res, async (uploadError) => {
    if (uploadError) {
      res.status(413).json({ error: uploadError.message })
      return
    }

    try {
      const authReq = req as AuthRequest
      const file = req.file
      if (!file) {
        throw new AppError('Audio file is required.', 400)
      }

      if (!isSpeechTranscriptionConfigured()) {
        throw new AppError(
          'Speech transcription is not configured on the server. Add GROQ_API_KEY to server/.env.',
          503,
        )
      }

      await assertUsageAllowed(authReq.user, file.size, 'speech-to-text')

      const language =
        typeof req.body?.language === 'string' && req.body.language.trim()
          ? req.body.language.trim()
          : 'en'

      const { text, provider } = await transcribeAudioBuffer(
        file.buffer,
        file.originalname || 'audio.webm',
        language,
      )

      await recordJob({
        userId: authReq.user?.sub,
        toolSlug: 'speech-to-text',
        originalSize: file.size,
        compressedSize: text.length,
        status: 'COMPLETED',
      })

      res.json({ text, provider })
    } catch (error) {
      next(error)
    }
  })
})

speechRouter.post('/complete', async (req, res, next) => {
  try {
    const authReq = req as AuthRequest
    const parsed = recordSpeechJobSchema.safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid job metadata' })
      return
    }

    await recordJob({
      userId: authReq.user?.sub,
      toolSlug: 'text-to-speech',
      originalSize: parsed.data.textLength,
      compressedSize: parsed.data.outputSize,
      status: 'COMPLETED',
    })

    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})
