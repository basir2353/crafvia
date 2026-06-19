import { Router } from 'express'
import { optionalAuth, type AuthRequest } from '../middleware/auth.js'
import { AppError } from '../middleware/errorHandler.js'
import { generateAiImage } from '../services/aiImageGenerate.js'
import { generateNames } from '../services/genNameAi.js'
import { processGenTool } from '../services/genProcess.js'
import { assertAiUsageAllowed } from '../services/aiUsageService.js'
import { recordJob } from '../services/usageService.js'
import {
  genToolRequestSchema,
  genToolSlugSchema,
  imageGenerateSchema,
  nameGenerateSchema,
} from '../validators/gen.js'

export const genRouter = Router()

genRouter.use(optionalAuth)

genRouter.post('/:slug', async (req, res, next) => {
  try {
    const slugResult = genToolSlugSchema.safeParse(req.params.slug)
    if (!slugResult.success) {
      throw new AppError('Unknown generation tool.', 404)
    }

    const bodyResult = genToolRequestSchema.safeParse(req.body)
    if (!bodyResult.success) {
      res.status(400).json({
        error: 'Invalid request',
        details: bodyResult.error.issues.map((issue) => issue.message),
      })
      return
    }

    const result = processGenTool(slugResult.data, bodyResult.data)
    if (result.error) {
      throw new AppError(result.error, 400)
    }

    res.json(result)
  } catch (error) {
    next(error)
  }
})

genRouter.post('/image/generate', async (req, res, next) => {
  try {
    const authReq = req as AuthRequest
    const parsed = imageGenerateSchema.safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({
        error: 'Invalid request',
        details: parsed.error.issues.map((issue) => issue.message),
      })
      return
    }

    await assertAiUsageAllowed(authReq.user, parsed.data.prompt.length, 'image-generator')

    const result = await generateAiImage(parsed.data.prompt, parsed.data.aspectRatio)

    await recordJob({
      userId: authReq.user?.sub,
      toolSlug: 'image-generator',
      originalSize: parsed.data.prompt.length,
      compressedSize: result.imageBase64.length,
      status: 'COMPLETED',
    })

    res.json(result)
  } catch (error) {
    next(error)
  }
})

genRouter.post('/name/generate', async (req, res, next) => {
  try {
    const authReq = req as AuthRequest
    const parsed = nameGenerateSchema.safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({
        error: 'Invalid request',
        details: parsed.error.issues.map((issue) => issue.message),
      })
      return
    }

    const inputSize = (parsed.data.keyword?.length ?? 0) + 20
    await assertAiUsageAllowed(authReq.user, inputSize, 'name-generator')

    const result = await generateNames(parsed.data)

    await recordJob({
      userId: authReq.user?.sub,
      toolSlug: 'name-generator',
      originalSize: inputSize,
      compressedSize: result.names.join('\n').length,
      status: 'COMPLETED',
    })

    res.json({
      output: result.names.join('\n'),
      meta: { count: result.names.length, provider: result.provider },
    })
  } catch (error) {
    next(error)
  }
})
