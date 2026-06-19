import { Router } from 'express'
import { AppError } from '../middleware/errorHandler.js'
import { processSeoTool } from '../services/seoProcess.js'
import { seoToolRequestSchema, seoToolSlugSchema } from '../validators/seo.js'

export const seoRouter = Router()

seoRouter.post('/:slug', (req, res, next) => {
  try {
    const slugResult = seoToolSlugSchema.safeParse(req.params.slug)
    if (!slugResult.success) {
      throw new AppError('Unknown SEO tool.', 404)
    }

    const bodyResult = seoToolRequestSchema.safeParse(req.body)
    if (!bodyResult.success) {
      res.status(400).json({
        error: 'Invalid request',
        details: bodyResult.error.issues.map((issue) => issue.message),
      })
      return
    }

    const result = processSeoTool(slugResult.data, bodyResult.data)
    if (result.error) {
      throw new AppError(result.error, 400)
    }

    res.json(result)
  } catch (error) {
    next(error)
  }
})
