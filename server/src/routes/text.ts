import { Router } from 'express'
import { AppError } from '../middleware/errorHandler.js'
import { EMOJI_CATEGORIES, processTextTool } from '../services/textProcess.js'
import { textToolRequestSchema, textToolSlugSchema } from '../validators/text.js'

export const textRouter = Router()

textRouter.get('/emoji', (_req, res) => {
  res.json({ categories: EMOJI_CATEGORIES })
})

textRouter.post('/:slug', (req, res, next) => {
  try {
    const slugResult = textToolSlugSchema.safeParse(req.params.slug)
    if (!slugResult.success) {
      throw new AppError('Unknown text tool.', 404)
    }

    const bodyResult = textToolRequestSchema.safeParse(req.body)
    if (!bodyResult.success) {
      res.status(400).json({
        error: 'Invalid request',
        details: bodyResult.error.issues.map((issue) => issue.message),
      })
      return
    }

    const result = processTextTool(slugResult.data, bodyResult.data)
    if (result.error) {
      throw new AppError(result.error, 400)
    }

    res.json(result)
  } catch (error) {
    next(error)
  }
})
