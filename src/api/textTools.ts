import type { TextToolRequest, TextToolResponse, TextToolSlug } from '../utils/textProcess'
import { EMOJI_CATEGORIES, processTextTool } from '../utils/textProcess'

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string; details?: string[] }
    if (data.details?.length) return data.details.join(' ')
    return data.error ?? 'Something went wrong'
  } catch {
    return 'Something went wrong'
  }
}

/** Process text locally in the browser (instant, private). */
export function processTextLocal(slug: TextToolSlug, request: TextToolRequest): TextToolResponse {
  try {
    return processTextTool(slug, request)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Processing failed.' }
  }
}

/** Process text via server API (optional remote processing). */
export async function processTextRemote(
  slug: TextToolSlug,
  request: TextToolRequest,
): Promise<TextToolResponse> {
  const response = await fetch(`/api/text/${slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return response.json() as Promise<TextToolResponse>
}

export async function fetchEmojiCategories() {
  const response = await fetch('/api/text/emoji')
  if (!response.ok) {
    return EMOJI_CATEGORIES
  }
  const data = (await response.json()) as { categories: typeof EMOJI_CATEGORIES }
  return data.categories ?? EMOJI_CATEGORIES
}

export { EMOJI_CATEGORIES, processTextTool }
