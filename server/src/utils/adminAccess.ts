import { env } from '../config/env.js'
import { prisma } from '../db/client.js'

export function getAdminEmailSet(): Set<string> {
  return new Set(
    env.ADMIN_EMAILS.split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
}

export async function syncAdminRole(user: {
  id: string
  email: string
  role: 'USER' | 'ADMIN'
}): Promise<'USER' | 'ADMIN'> {
  const adminEmails = getAdminEmailSet()
  if (!adminEmails.has(user.email.toLowerCase())) {
    return user.role
  }
  if (user.role === 'ADMIN') {
    return user.role
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { role: 'ADMIN' },
  })
  return 'ADMIN'
}
