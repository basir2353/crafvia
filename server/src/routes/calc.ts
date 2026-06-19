import { Router } from 'express'
import { AppError } from '../middleware/errorHandler.js'
import { processCalcTool } from '../services/calcProcess.js'
import { calcToolRequestSchema, calcToolSlugSchema } from '../validators/calc.js'

export const calcRouter = Router()

calcRouter.post('/:slug', (req, res, next) => {
  try {
    const slugResult = calcToolSlugSchema.safeParse(req.params.slug)
    if (!slugResult.success) {
      throw new AppError('Unknown calculator tool.', 404)
    }

    const bodyResult = calcToolRequestSchema.safeParse(req.body)
    if (!bodyResult.success) {
      res.status(400).json({
        error: 'Invalid request',
        details: bodyResult.error.issues.map((issue) => issue.message),
      })
      return
    }

    const result = processCalcTool(slugResult.data, bodyResult.data)
    if (result.error) {
      throw new AppError(result.error, 400)
    }

    res.json(result)
  } catch (error) {
    next(error)
  }
})
