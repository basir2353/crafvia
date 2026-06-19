import { prisma } from '../db/client.js'

export async function getAdminDashboard() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalUsers,
    proUsers,
    adminUsers,
    totalTools,
    activeTools,
    totalJobs,
    completedJobs,
    failedJobs,
    jobsToday,
    recentJobs,
    topTools,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { plan: 'PRO' } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.tool.count(),
    prisma.tool.count({ where: { isActive: true } }),
    prisma.processingJob.count(),
    prisma.processingJob.count({ where: { status: 'COMPLETED' } }),
    prisma.processingJob.count({ where: { status: 'FAILED' } }),
    prisma.processingJob.count({ where: { createdAt: { gte: today } } }),
    prisma.processingJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        toolSlug: true,
        status: true,
        originalSize: true,
        compressedSize: true,
        createdAt: true,
        user: { select: { email: true } },
      },
    }),
    prisma.processingJob.groupBy({
      by: ['toolSlug'],
      _count: { _all: true },
      orderBy: { _count: { toolSlug: 'desc' } },
      take: 8,
    }),
  ])

  return {
    users: { total: totalUsers, pro: proUsers, admins: adminUsers },
    tools: { total: totalTools, active: activeTools },
    jobs: {
      total: totalJobs,
      completed: completedJobs,
      failed: failedJobs,
      today: jobsToday,
    },
    recentJobs,
    topTools: topTools.map((item) => ({
      toolSlug: item.toolSlug,
      count: item._count._all,
    })),
  }
}
