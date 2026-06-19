/**
 * One-time: copy users from Docker Postgres (5433) to PostgreSQL 18 (5432)
 * so pgAdmin and the app use the same database.
 */
import { PrismaClient } from '@prisma/client'

const source = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres:12345@localhost:5433/crafvia?schema=public' } },
})
const target = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres:12345@localhost:5432/crafvia?schema=public' } },
})

try {
  const users = await source.user.findMany({
    include: { refreshTokens: true, subscriptions: true },
  })

  if (users.length === 0) {
    console.log('No users to migrate from port 5433.')
    process.exit(0)
  }

  for (const user of users) {
    await target.user.upsert({
      where: { email: user.email },
      create: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
        plan: user.plan,
        stripeCustomerId: user.stripeCustomerId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      update: {
        passwordHash: user.passwordHash,
        name: user.name,
        plan: user.plan,
        stripeCustomerId: user.stripeCustomerId,
        updatedAt: user.updatedAt,
      },
    })

    for (const token of user.refreshTokens) {
      await target.refreshToken.upsert({
        where: { token: token.token },
        create: {
          id: token.id,
          token: token.token,
          userId: user.id,
          expiresAt: token.expiresAt,
          createdAt: token.createdAt,
        },
        update: {
          expiresAt: token.expiresAt,
        },
      })
    }

    for (const sub of user.subscriptions) {
      const existing = await target.subscription.findFirst({
        where: { userId: user.id, status: sub.status },
      })
      if (!existing) {
        await target.subscription.create({
          data: {
            id: sub.id,
            userId: user.id,
            plan: sub.plan,
            status: sub.status,
            stripeSubscriptionId: sub.stripeSubscriptionId,
            currentPeriodEnd: sub.currentPeriodEnd,
            createdAt: sub.createdAt,
            updatedAt: sub.updatedAt,
          },
        })
      }
    }

    console.log(`Migrated: ${user.email}`)
  }

  const count = await target.user.count()
  console.log(`\nDone. PostgreSQL 18 (port 5432) now has ${count} user(s).`)
} catch (error) {
  console.error('Migration failed:', error.message)
  process.exit(1)
} finally {
  await source.$disconnect()
  await target.$disconnect()
}
