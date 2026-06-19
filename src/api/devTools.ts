import type { DevToolRequest, DevToolResponse, DevToolSlug } from '../utils/devProcess'
import { processDevTool } from '../utils/devProcess'

export function processDevLocal(slug: DevToolSlug, request: DevToolRequest): DevToolResponse {
  try {
    return processDevTool(slug, request)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Processing failed.' }
  }
}

export async function processDevRemote(
  slug: DevToolSlug,
  request: DevToolRequest,
): Promise<DevToolResponse> {
  const response = await fetch(`/api/dev/${slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? 'Something went wrong')
  }
  return response.json() as Promise<DevToolResponse>
}

export { processDevTool }
