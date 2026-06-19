import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

try {
  const toolCount = await prisma.tool.count({ where: { isActive: true } })
  const categoryCount = await prisma.category.count()
  const userCount = await prisma.user.count()
  const toolsWithoutHref = await prisma.tool.count({
    where: { isActive: true, href: null },
  })

  console.log('=== Crafvia Health Check ===')
  console.log(`Database: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')}`)
  console.log(`Categories: ${categoryCount} (expected 14)`)
  console.log(`Tools: ${toolCount} (expected 180)`)
  console.log(`Users: ${userCount}`)
  console.log(`Tools missing href: ${toolsWithoutHref}`)

  if (toolCount !== 180) {
    console.log('\nFIX: Run npm run db:seed in the server folder')
    process.exit(1)
  }

  if (toolsWithoutHref > 0) {
    console.log('\nFIX: Some tools have no page href')
    process.exit(1)
  }

  console.log('\nAll 180 tools are in the database and ready.')
} catch (error) {
  console.error('Health check failed:', error.message)
  console.log('\nFIX: Start PostgreSQL and run npm run db:setup')
  process.exit(1)
} finally {
  await prisma.$disconnect()
}
