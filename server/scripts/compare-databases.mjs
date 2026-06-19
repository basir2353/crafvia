import { PrismaClient } from '@prisma/client'

const urls = [
  { label: 'App DB (port 5433 - Docker)', url: 'postgresql://postgres:12345@localhost:5433/crafvia?schema=public' },
  { label: 'pgAdmin DB (port 5432 - PostgreSQL 18)', url: 'postgresql://postgres:12345@localhost:5432/crafvia?schema=public' },
]

for (const { label, url } of urls) {
  const prisma = new PrismaClient({ datasources: { db: { url } } })
  try {
    const users = await prisma.user.count()
    const tools = await prisma.tool.count()
    console.log(`\n${label}`)
    console.log(`  Connected: YES`)
    console.log(`  Users: ${users}`)
    console.log(`  Tools: ${tools}`)
  } catch (error) {
    console.log(`\n${label}`)
    console.log(`  Connected: NO — ${error.message.split('\n')[0]}`)
  } finally {
    await prisma.$disconnect()
  }
}
