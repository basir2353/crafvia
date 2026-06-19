import { apiFetch } from './client'

export type PublicStats = {
  tools: string
  filesUploadedToServers: string
  filesProcessed: string
  freeBasicAccess: string
}

export async function fetchStats() {
  return apiFetch<PublicStats>('/api/stats')
}
