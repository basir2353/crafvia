import { Router } from 'express'
import { AppError } from '../middleware/errorHandler.js'
import { convertCurrencyAmount, processConvertTool } from '../services/convertProcess.js'
import { getCurrencyRates } from '../services/currencyRates.js'
import {
  convertToolRequestSchema,
  convertToolSlugSchema,
  currencyConvertSchema,
  currencyRatesQuerySchema,
} from '../validators/convert.js'

export const convertRouter = Router()

convertRouter.get('/currency/rates', async (req, res, next) => {
  try {
    const parsed = currencyRatesQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid base currency code.' })
      return
    }

    const rates = await getCurrencyRates(parsed.data.base)
    res.json(rates)
  } catch (error) {
    next(error)
  }
})

convertRouter.post('/currency/convert', async (req, res, next) => {
  try {
    const parsed = currencyConvertSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({
        error: 'Invalid request',
        details: parsed.error.issues.map((issue) => issue.message),
      })
      return
    }

    const { base, rates, updatedAt, provider } = await getCurrencyRates(parsed.data.base)
    const result = convertCurrencyAmount(
      parsed.data.amount,
      parsed.data.from,
      parsed.data.to,
      rates,
      base,
    )

    if (result.error) {
      throw new AppError(result.error, 400)
    }

    res.json({
      ...result,
      meta: {
        ...result.meta,
        updatedAt,
        provider,
        base,
      },
    })
  } catch (error) {
    next(error)
  }
})

convertRouter.post('/:slug', (req, res, next) => {
  try {
    const slugResult = convertToolSlugSchema.safeParse(req.params.slug)
    if (!slugResult.success) {
      throw new AppError('Unknown converter tool.', 404)
    }

    const bodyResult = convertToolRequestSchema.safeParse(req.body)
    if (!bodyResult.success) {
      res.status(400).json({
        error: 'Invalid request',
        details: bodyResult.error.issues.map((issue) => issue.message),
      })
      return
    }

    const result = processConvertTool(slugResult.data, bodyResult.data)
    if (result.error) {
      throw new AppError(result.error, 400)
    }

    res.json(result)
  } catch (error) {
    next(error)
  }
})
