import type { SeoToolRequest, SeoToolResponse, SeoToolSlug } from '../utils/seoProcess'
import { processSeoTool } from '../utils/seoProcess'

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string; details?: string[] }
    if (data.details?.length) return data.details.join(' ')
    return data.error ?? 'Something went wrong'
  } catch {
    return 'Something went wrong'
  }
}

export function processSeoLocal(slug: SeoToolSlug, request: SeoToolRequest): SeoToolResponse {
  try {
    return processSeoTool(slug, request)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Processing failed.' }
  }
}

export async function processSeoRemote(
  slug: SeoToolSlug,
  request: SeoToolRequest,
): Promise<SeoToolResponse> {
  const response = await fetch(`/api/seo/${slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return response.json() as Promise<SeoToolResponse>
}

export { processSeoTool }
