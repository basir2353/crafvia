import { env } from '../config/env.js'
import { prisma } from '../db/client.js'
import { AppError } from '../middleware/errorHandler.js'
import type { AccessTokenPayload } from '../utils/jwt.js'

export function getMaxFileBytes(plan: 'FREE' | 'PRO'): number {
  const mb = plan === 'PRO' ? env.PRO_MAX_FILE_MB : env.FREE_MAX_FILE_MB
  return mb * 1024 * 1024
}

export function getDailyJobLimit(plan: 'FREE' | 'PRO'): number {
  return plan === 'PRO' ? env.PRO_DAILY_JOBS : env.FREE_DAILY_JOBS
}

export async function assertUsageAllowed(
  user: AccessTokenPayload | undefined,
  fileSize: number,
  toolSlug: string,
) {
  const plan = user?.plan ?? 'FREE'
  const maxBytes = getMaxFileBytes(plan)

  if (fileSize > maxBytes) {
    throw new AppError(
      `File exceeds ${plan === 'PRO' ? env.PRO_MAX_FILE_MB : env.FREE_MAX_FILE_MB}MB limit for ${plan} plan.`,
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

    const limit = getDailyJobLimit(plan)
    if (jobsToday >= limit) {
      throw new AppError(
        `Daily processing limit reached (${limit}). Upgrade to Pro for higher limits.`,
        429,
      )
    }
  }

  const tool = await prisma.tool.findUnique({ where: { slug: toolSlug } })
  if (tool?.requiresPro && plan !== 'PRO') {
    throw new AppError('This tool requires a Pro subscription.', 403)
  }
}

export async function recordJob(input: {
  userId?: string
  toolSlug: string
  originalSize: number
  compressedSize?: number
  status: 'COMPLETED' | 'FAILED'
  errorMessage?: string
}) {
  return prisma.processingJob.create({
    data: {
      userId: input.userId,
      toolSlug: input.toolSlug,
      originalSize: input.originalSize,
      compressedSize: input.compressedSize,
      status: input.status,
      errorMessage: input.errorMessage,
    },
  })
}
