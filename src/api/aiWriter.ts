import type {
  ContentType,
  ImprovementType,
  LengthType,
  ToneType,
  WriterMode,
} from '../utils/aiWriterOptions'

export type AiWriterRequest = {
  mode: WriterMode | 'continue'
  prompt?: string
  sourceText?: string
  existingContent?: string
  contentType?: ContentType
  improvementType?: ImprovementType
  tone: ToneType
  customTone?: string
  length: LengthType
  customWordCount?: number
  targetLanguage?: string
  toolSlug?: string
}

export type AiWriterLimits = {
  plan: string
  maxPromptLength: number
  maxSourceLength: number
  dailyJobs: number
  requiresPro: boolean
  configured: boolean
  provider: string
  providers?: Record<string, boolean>
  devFallback?: boolean
}

export type AiWriterResult = {
  content: string
  wordCount: number
  characterCount: number
  provider?: string
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
    const data = (await response.json()) as {
      error?: string
      details?: string[]
    }
    if (data.details?.length) {
      return data.details.join(' ')
    }
    return data.error ?? 'Something went wrong'
  } catch {
    return 'Something went wrong'
  }
}

export async function fetchAiWriterLimits(): Promise<AiWriterLimits> {
  const response = await fetch('/api/ai/limits', {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return response.json() as Promise<AiWriterLimits>
}

export async function generateAiContent(
  request: AiWriterRequest,
): Promise<AiWriterResult> {
  const response = await fetch('/api/ai/writer/generate', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return response.json() as Promise<AiWriterResult>
}
