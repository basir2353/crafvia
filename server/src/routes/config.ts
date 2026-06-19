import { Router } from 'express'
import { env } from '../config/env.js'
import { prisma } from '../db/client.js'

export const configRouter = Router()

configRouter.get('/', async (_req, res, next) => {
  try {
    const configs = await prisma.siteConfig.findMany()
    const map = Object.fromEntries(configs.map((item) => [item.key, item.value]))

    res.json({
      donateUrl: map.donate_url ?? env.DONATE_URL,
      proPriceMonthly: map.pro_price_monthly ?? '9',
      stripeCheckoutUrl: map.stripe_checkout_url || env.STRIPE_CHECKOUT_URL || null,
      supportEmail: map.support_email ?? 'support@crafvia.com',
    })
  } catch (error) {
    next(error)
  }
})
