import { Router } from 'express'
import { AppError } from '../middleware/errorHandler.js'
import { processDevTool } from '../services/devProcess.js'
import { devToolRequestSchema, devToolSlugSchema } from '../validators/dev.js'

export const devRouter = Router()

devRouter.post('/:slug', (req, res, next) => {
  try {
    const slugResult = devToolSlugSchema.safeParse(req.params.slug)
    if (!slugResult.success) {
      throw new AppError('Unknown developer tool.', 404)
    }

    const bodyResult = devToolRequestSchema.safeParse(req.body)
    if (!bodyResult.success) {
      res.status(400).json({
        error: 'Invalid request',
        details: bodyResult.error.issues.map((issue) => issue.message),
      })
      return
    }

    const result = processDevTool(slugResult.data, bodyResult.data)
    if (result.error) {
      throw new AppError(result.error, 400)
    }

    res.json(result)
  } catch (error) {
    next(error)
  }
})
