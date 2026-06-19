import { Router } from 'express'
import { env } from '../config/env.js'
import { prisma } from '../db/client.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { AppError } from '../middleware/errorHandler.js'

export const subscriptionsRouter = Router()

subscriptionsRouter.get('/plans', async (_req, res) => {
  res.json({
    plans: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'month',
        features: [
          'All basic tools',
          'Single file processing',
          `${process.env.FREE_MAX_FILE_MB ?? 20}MB file limit`,
          `${process.env.FREE_DAILY_JOBS ?? 50} jobs per day`,
        ],
      },
      {
        id: 'pro',
        name: 'Pro',
        price: Number(process.env.PRO_PRICE_MONTHLY ?? 9),
        interval: 'month',
        features: [
          'Batch file processing',
          'EXIF preservation',
          `${process.env.PRO_MAX_FILE_MB ?? 100}MB file limit`,
          `${process.env.PRO_DAILY_JOBS ?? 1000} jobs per day`,
          'Priority processing',
        ],
      },
    ],
  })
})

subscriptionsRouter.post('/checkout', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const configs = await prisma.siteConfig.findMany()
    const map = Object.fromEntries(configs.map((item) => [item.key, item.value]))
    const checkoutUrl = map.stripe_checkout_url || env.STRIPE_CHECKOUT_URL

    if (!checkoutUrl) {
      await prisma.user.update({
        where: { id: req.user!.sub },
        data: { plan: 'PRO' },
      })
      const existing = await prisma.subscription.findFirst({
        where: { userId: req.user!.sub, status: 'ACTIVE' },
      })
      if (existing) {
        await prisma.subscription.update({
          where: { id: existing.id },
          data: { plan: 'PRO', status: 'ACTIVE' },
        })
      } else {
        await prisma.subscription.create({
          data: {
            userId: req.user!.sub,
            plan: 'PRO',
            status: 'ACTIVE',
          },
        })
      }

      res.json({
        message: 'Pro activated (demo mode — configure STRIPE_CHECKOUT_URL for production)',
        plan: 'PRO',
      })
      return
    }

    res.json({ checkoutUrl })
  } catch (error) {
    next(error)
  }
})

subscriptionsRouter.get('/status', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } })
    if (!user) throw new AppError('User not found', 404)

    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    })

    res.json({
      plan: user.plan,
      subscription: subscription
        ? {
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
          }
        : null,
    })
  } catch (error) {
    next(error)
  }
})
