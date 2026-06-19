import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { prisma } from './client.js'

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const code = (error as { code?: string }).code
  return code === 'P2021' || code === '42P01'
}

export async function ensureDatabaseSchema(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1 FROM "User" LIMIT 1`
    return
  } catch (error) {
    if (!isMissingTableError(error)) {
      throw error
    }
  }

  console.log('[db] Auth tables not found. Creating database tables...')
  execSync('npx prisma migrate deploy', {
    cwd: serverRoot,
    stdio: 'inherit',
  })
  console.log('[db] Database tables created successfully.')
}
