import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/client.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { type AuthRequest } from '../middleware/auth.js'
import { AppError } from '../middleware/errorHandler.js'
import { getAdminDashboard } from '../services/adminService.js'

export const adminRouter = Router()

adminRouter.use(requireAdmin)

adminRouter.get('/dashboard', async (_req, res, next) => {
  try {
    res.json(await getAdminDashboard())
  } catch (error) {
    next(error)
  }
})

adminRouter.get('/site-config', async (_req, res, next) => {
  try {
    const items = await prisma.siteConfig.findMany({ orderBy: { key: 'asc' } })
    res.json({ items })
  } catch (error) {
    next(error)
  }
})

const siteConfigSchema = z.object({
  items: z.array(z.object({ key: z.string().min(1), value: z.string() })),
})

adminRouter.put('/site-config', async (req, res, next) => {
  try {
    const body = siteConfigSchema.parse(req.body)
    await Promise.all(
      body.items.map((item) =>
        prisma.siteConfig.upsert({
          where: { key: item.key },
          create: item,
          update: { value: item.value },
        }),
      ),
    )
    const items = await prisma.siteConfig.findMany({ orderBy: { key: 'asc' } })
    res.json({ items })
  } catch (error) {
    next(error)
  }
})

adminRouter.get('/content-pages', async (_req, res, next) => {
  try {
    const pages = await prisma.contentPage.findMany({ orderBy: { slug: 'asc' } })
    res.json({ pages })
  } catch (error) {
    next(error)
  }
})

const contentPageSchema = z.object({
  title: z.string().min(1),
  body: z.string(),
})

adminRouter.put('/content-pages/:slug', async (req, res, next) => {
  try {
    const body = contentPageSchema.parse(req.body)
    const page = await prisma.contentPage.update({
      where: { slug: req.params.slug },
      data: body,
    })
    res.json({ page })
  } catch (error) {
    next(error)
  }
})

adminRouter.get('/categories', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { tools: true } } },
    })
    res.json({ categories })
  } catch (error) {
    next(error)
  }
})

const categoryPatchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  iconName: z.string().min(1).optional(),
  iconBg: z.string().min(1).optional(),
  iconColor: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
})

adminRouter.patch('/categories/:id', async (req, res, next) => {
  try {
    const body = categoryPatchSchema.parse(req.body)
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: body,
      include: { _count: { select: { tools: true } } },
    })
    res.json({ category })
  } catch (error) {
    next(error)
  }
})

adminRouter.get('/tools', async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '').trim()
    const tools = await prisma.tool.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { slug: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      include: { category: { select: { slug: true, name: true } } },
    })
    res.json({ count: tools.length, tools })
  } catch (error) {
    next(error)
  }
})

const toolPatchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  href: z.string().nullable().optional(),
  keywords: z.string().optional(),
  isActive: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  requiresPro: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

adminRouter.patch('/tools/:id', async (req, res, next) => {
  try {
    const body = toolPatchSchema.parse(req.body)
    const tool = await prisma.tool.update({
      where: { id: req.params.id },
      data: body,
      include: { category: { select: { slug: true, name: true } } },
    })
    res.json({ tool })
  } catch (error) {
    next(error)
  }
})

adminRouter.get('/users', async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '').trim()
    const users = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { email: { contains: q, mode: 'insensitive' } },
              { name: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        role: true,
        createdAt: true,
        _count: { select: { processingJobs: true } },
      },
    })
    res.json({ count: users.length, users })
  } catch (error) {
    next(error)
  }
})

const userPatchSchema = z.object({
  plan: z.enum(['FREE', 'PRO']).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
})

adminRouter.patch('/users/:id', async (req: AuthRequest, res, next) => {
  try {
    const body = userPatchSchema.parse(req.body)
    if (body.role === 'USER' && req.params.id === req.user?.sub) {
      throw new AppError('You cannot remove your own admin access', 400)
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: body,
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        role: true,
        createdAt: true,
        _count: { select: { processingJobs: true } },
      },
    })
    res.json({ user })
  } catch (error) {
    next(error)
  }
})
