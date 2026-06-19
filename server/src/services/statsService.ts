import { prisma } from '../db/client.js'

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${Math.floor(count / 1_000_000)}M+`
  if (count >= 1_000) return `${Math.floor(count / 1_000)}K+`
  return String(count)
}

export async function getPublicStats() {
  const [toolCount, completedJobs, serverJobs] = await Promise.all([
    prisma.tool.count({ where: { isActive: true } }),
    prisma.processingJob.count({ where: { status: 'COMPLETED' } }),
    prisma.processingJob.count({
      where: {
        status: 'COMPLETED',
        toolSlug: { in: ['compress-pdf'] },
      },
    }),
  ])

  return {
    tools: `${toolCount}+`,
    filesUploadedToServers: String(serverJobs),
    filesProcessed: formatCount(Math.max(completedJobs, 50_000_000)),
    freeBasicAccess: '100%',
    raw: {
      toolCount,
      completedJobs,
      serverJobs,
    },
  }
}
