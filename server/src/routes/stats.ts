import { Router } from 'express'
import { getPublicStats } from '../services/statsService.js'

export const statsRouter = Router()

statsRouter.get('/', async (_req, res, next) => {
  try {
    const stats = await getPublicStats()
    res.json(stats)
  } catch (error) {
    next(error)
  }
})
