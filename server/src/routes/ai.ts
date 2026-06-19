import { Router } from 'express'
import { env } from '../config/env.js'
import { optionalAuth, type AuthRequest } from '../middleware/auth.js'
import { AppError } from '../middleware/errorHandler.js'
import { aiRateLimit } from '../middleware/rateLimit.js'
import {
  getAiStatusSync,
  isAiConfigured,
  resolveActiveProvider,
} from '../services/aiProvider.js'
import { assertAiUsageAllowed } from '../services/aiUsageService.js'
import { runAiWriter } from '../services/aiWriter.js'
import { recordJob } from '../services/usageService.js'
import { aiWriterRequestSchema, recordAiWriterJobSchema } from '../validators/ai.js'

export const aiRouter = Router()

aiRouter.use(aiRateLimit)
aiRouter.use(optionalAuth)

aiRouter.get('/status', async (_req, res, next) => {
  try {
    const status = getAiStatusSync()
    const configured = await isAiConfigured()
    let activeProvider: string | null = null

    if (configured) {
      activeProvider = await resolveActiveProvider()
    }

    res.json({
      ...status,
      configured,
      activeProvider,
      requiresPro: !env.AI_ALLOW_FREE_ACCESS,
      allowFreeAccess: env.AI_ALLOW_FREE_ACCESS,
    })
  } catch (error) {
    next(error)
  }
})

aiRouter.get('/limits', async (req, res, next) => {
  try {
    const plan = (req as AuthRequest).user?.plan ?? 'FREE'
    const configured = await isAiConfigured()
    let activeProvider: string | null = null

    if (configured) {
      activeProvider = await resolveActiveProvider()
    }

    res.json({
      plan,
      maxPromptLength: 10_000,
      maxSourceLength: 20_000,
      dailyJobs: plan === 'PRO' ? env.PRO_DAILY_JOBS : env.FREE_DAILY_JOBS,
      requiresPro: !env.AI_ALLOW_FREE_ACCESS,
      configured,
      provider: activeProvider ?? env.AI_PROVIDER,
      providers: getAiStatusSync().providers,
      devFallback: env.AI_DEV_FALLBACK,
    })
  } catch (error) {
    next(error)
  }
})

aiRouter.post('/writer/generate', async (req, res, next) => {
  try {
    const authReq = req as AuthRequest
    const parsed = aiWriterRequestSchema.safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({
        error: 'Invalid request',
        details: parsed.error.issues.map((issue) => issue.message),
      })
      return
    }

    const inputSize =
      (parsed.data.prompt?.length ?? 0) +
      (parsed.data.sourceText?.length ?? 0) +
      (parsed.data.existingContent?.length ?? 0)

    const toolSlug = parsed.data.toolSlug?.trim() || 'ai-writer'
    await assertAiUsageAllowed(authReq.user, inputSize, toolSlug)

    if (!(await isAiConfigured())) {
      throw new AppError(
        'AI service is not configured. Add an API key to server/.env or enable AI_DEV_FALLBACK=true.',
        503,
      )
    }

    const result = await runAiWriter(parsed.data)
    const activeProvider = await resolveActiveProvider()

    await recordJob({
      userId: authReq.user?.sub,
      toolSlug,
      originalSize: inputSize,
      compressedSize: result.content.length,
      status: 'COMPLETED',
    })

    res.json({
      content: result.content,
      wordCount: result.wordCount,
      characterCount: result.content.length,
      provider: activeProvider,
    })
  } catch (error) {
    next(error)
  }
})

aiRouter.post('/writer/complete', async (req, res, next) => {
  try {
    const authReq = req as AuthRequest
    const parsed = recordAiWriterJobSchema.safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid job metadata' })
      return
    }

    await recordJob({
      userId: authReq.user?.sub,
      toolSlug: 'ai-writer',
      originalSize: parsed.data.promptLength,
      compressedSize: parsed.data.outputLength,
      status: 'COMPLETED',
    })

    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})
