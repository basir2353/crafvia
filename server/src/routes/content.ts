import { Router } from 'express'
import { prisma } from '../db/client.js'
import { AppError } from '../middleware/errorHandler.js'

export const contentRouter = Router()

const slugMap: Record<string, string> = {
  pricing: 'pricing',
  privacy: 'privacy',
  'privacy-policy': 'privacy',
  terms: 'terms',
  'terms-of-service': 'terms',
  about: 'about',
  faq: 'faq',
  blog: 'blog',
  changelog: 'changelog',
}

contentRouter.get('/pages/:slug', async (req, res, next) => {
  try {
    const slug = slugMap[req.params.slug] ?? req.params.slug
    const page = await prisma.contentPage.findUnique({ where: { slug } })
    if (!page) throw new AppError('Page not found', 404)
    res.json({ page })
  } catch (error) {
    next(error)
  }
})
