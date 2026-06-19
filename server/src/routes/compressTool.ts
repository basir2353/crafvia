import { Router } from 'express'
import { AppError } from '../middleware/errorHandler.js'
import { processCompressTool } from '../services/compressProcess.js'
import { compressToolRequestSchema, compressToolSlugSchema } from '../validators/compressTool.js'

export const compressToolRouter = Router()

compressToolRouter.post('/:slug', (req, res, next) => {
  try {
    const slugResult = compressToolSlugSchema.safeParse(req.params.slug)
    if (!slugResult.success) {
      throw new AppError('Unknown compressor tool.', 404)
    }

    const bodyResult = compressToolRequestSchema.safeParse(req.body)
    if (!bodyResult.success) {
      res.status(400).json({
        error: 'Invalid request',
        details: bodyResult.error.issues.map((issue) => issue.message),
      })
      return
    }

    const result = processCompressTool(slugResult.data, bodyResult.data)
    if (result.error) {
      throw new AppError(result.error, 400)
    }

    res.json(result)
  } catch (error) {
    next(error)
  }
})
