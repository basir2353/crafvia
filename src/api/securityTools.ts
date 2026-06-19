import type { SecurityToolRequest, SecurityToolResponse } from '../utils/securityProcess'
import { processSecurityTool } from '../utils/securityProcess'

export function processSecurityLocal(
  slug: Parameters<typeof processSecurityTool>[0],
  request: SecurityToolRequest,
): SecurityToolResponse {
  try {
    return processSecurityTool(slug, request)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Security operation failed.' }
  }
}

export async function fetchSslCheck(host: string): Promise<SecurityToolResponse> {
  const response = await fetch('/api/security/ssl-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ host }),
  })
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? 'SSL check failed.')
  }
  return response.json() as Promise<SecurityToolResponse>
}

export async function fetchIpLookup(ip: string): Promise<SecurityToolResponse> {
  const response = await fetch(`/api/security/ip-lookup?ip=${encodeURIComponent(ip)}`)
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? 'IP lookup failed.')
  }
  return response.json() as Promise<SecurityToolResponse>
}

export async function fetchWhoisLookup(domain: string): Promise<SecurityToolResponse> {
  const response = await fetch(`/api/security/whois-lookup?domain=${encodeURIComponent(domain)}`)
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? 'WHOIS lookup failed.')
  }
  return response.json() as Promise<SecurityToolResponse>
}

export { processSecurityTool }
