import type {
  GenToolRequest,
  GenToolResponse,
  GenToolSlug,
  ImageAspectRatio,
  NameCategory,
} from '../utils/genProcess'
import { processGenTool } from '../utils/genProcess'

export type ImageGenerateResult = {
  imageBase64: string
  mimeType: string
  provider: string
  fallback: boolean
  width: number
  height: number
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('crafvia_access_token')
  return token
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    : { 'Content-Type': 'application/json' }
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string; details?: string[] }
    if (data.details?.length) return data.details.join(' ')
    return data.error ?? 'Something went wrong'
  } catch {
    return 'Something went wrong'
  }
}

export function processGenLocal(slug: GenToolSlug, request: GenToolRequest): GenToolResponse {
  try {
    return processGenTool(slug, request)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Generation failed.' }
  }
}

export async function generateAiImageRemote(
  prompt: string,
  aspectRatio: ImageAspectRatio,
): Promise<ImageGenerateResult> {
  const response = await fetch('/api/gen/image/generate', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ prompt, aspectRatio }),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return response.json() as Promise<ImageGenerateResult>
}

export async function generateNamesRemote(input: {
  category: NameCategory
  keyword?: string
  count: number
  useAi?: boolean
}): Promise<GenToolResponse> {
  const response = await fetch('/api/gen/name/generate', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return response.json() as Promise<GenToolResponse>
}

export { processGenTool }
