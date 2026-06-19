import { Router } from 'express'
import { AppError } from '../middleware/errorHandler.js'
import {
  getCategoryBySlug,
  getToolBySlug,
  listCategories,
  listTools,
  searchTools,
} from '../services/toolsService.js'

export const toolsRouter = Router()

toolsRouter.get('/categories', async (_req, res, next) => {
  try {
    const categories = await listCategories()
    res.json({ categories })
  } catch (error) {
    next(error)
  }
})

toolsRouter.get('/categories/:slug', async (req, res, next) => {
  try {
    const category = await getCategoryBySlug(req.params.slug)
    if (!category) throw new AppError('Category not found', 404)
    res.json({ category })
  } catch (error) {
    next(error)
  }
})

toolsRouter.get('/search', async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '')
    const limit = Number(req.query.limit ?? 20)
    const tools = await searchTools(q, limit)
    res.json({
      query: q,
      count: tools.length,
      tools: tools.map(formatTool),
    })
  } catch (error) {
    next(error)
  }
})

toolsRouter.get('/', async (req, res, next) => {
  try {
    const category = req.query.category ? String(req.query.category) : undefined
    const popular = req.query.popular === 'true'
    const limit = req.query.limit ? Number(req.query.limit) : undefined
    const tools = await listTools({ category, popular, limit })
    res.json({ count: tools.length, tools: tools.map(formatTool) })
  } catch (error) {
    next(error)
  }
})

toolsRouter.get('/:slug', async (req, res, next) => {
  try {
    const tool = await getToolBySlug(req.params.slug)
    if (!tool) throw new AppError('Tool not found', 404)
    res.json({ tool: formatTool(tool) })
  } catch (error) {
    next(error)
  }
})

function formatTool(tool: {
  slug: string
  name: string
  description: string
  href: string | null
  keywords: string
  isPopular: boolean
  requiresPro: boolean
  compressionMode: string | null
  accept: string | null
  category: { slug: string; name: string; iconName?: string; iconBg?: string; iconColor?: string }
}) {
  return {
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    href: tool.href,
    keywords: tool.keywords,
    isPopular: tool.isPopular,
    requiresPro: tool.requiresPro,
    compressionMode: tool.compressionMode,
    accept: tool.accept,
    category: {
      slug: tool.category.slug,
      name: tool.category.name,
      iconName: tool.category.iconName,
      iconBg: tool.category.iconBg,
      iconColor: tool.category.iconColor,
    },
  }
}
