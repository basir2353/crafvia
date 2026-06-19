import { env } from '../config/env.js'
import { prisma } from '../db/client.js'
import { AppError } from '../middleware/errorHandler.js'
import type { AccessTokenPayload } from '../utils/jwt.js'
import { getDailyJobLimit } from './usageService.js'

const AI_TEXT_MAX_CHARS = 20_000

export async function assertAiUsageAllowed(
  user: AccessTokenPayload | undefined,
  inputChars: number,
  toolSlug: string,
) {
  if (inputChars > AI_TEXT_MAX_CHARS) {
    throw new AppError(
      `Input exceeds ${AI_TEXT_MAX_CHARS.toLocaleString()} character limit.`,
      413,
    )
  }

  if (user) {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const jobsToday = await prisma.processingJob.count({
      where: {
        userId: user.sub,
        createdAt: { gte: startOfDay },
        status: 'COMPLETED',
      },
    })

    const plan = user.plan ?? 'FREE'
    const limit = getDailyJobLimit(plan)
    if (jobsToday >= limit) {
      throw new AppError(
        `Daily AI limit reached (${limit}). Upgrade to Pro for higher limits.`,
        429,
      )
    }
  }

  if (!env.AI_ALLOW_FREE_ACCESS) {
    const plan = user?.plan ?? 'FREE'
    const tool = await prisma.tool.findUnique({ where: { slug: toolSlug } })
    if (tool?.requiresPro && plan !== 'PRO') {
      throw new AppError('This tool requires a Pro subscription.', 403)
    }
  }
}
