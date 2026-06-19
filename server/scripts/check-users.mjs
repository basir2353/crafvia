import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

try {
  const count = await prisma.user.count()
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, plan: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  const dbUrl = process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') ?? 'not set'
  console.log('Database:', dbUrl)
  if (dbUrl.includes(':5433')) {
    console.log('WARNING: App is on port 5433. pgAdmin uses port 5432 — data will NOT match!')
  }
  console.log('User table rows:', count)
  if (users.length > 0) {
    console.log('Users:')
    for (const user of users) {
      console.log(`  - ${user.email} (${user.name ?? 'no name'}) plan=${user.plan}`)
    }
  }
} catch (error) {
  console.error('DB check failed:', error.message)
  process.exit(1)
} finally {
  await prisma.$disconnect()
}
