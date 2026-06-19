import { env } from '../config/env.js'
import { AppError } from '../middleware/errorHandler.js'
import { generateTemplateFallback } from './aiTemplateFallback.js'

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type AiProviderName =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'groq'
  | 'ollama'
  | 'template'

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504])

let cachedOllamaAvailable: boolean | null = null
let activeProviderCache: AiProviderName | null = null

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function hasKey(value: string | undefined): boolean {
  return Boolean(value?.trim())
}

async function isOllamaReachable(): Promise<boolean> {
  if (!env.OLLAMA_ENABLED) return false
  if (cachedOllamaAvailable !== null) return cachedOllamaAvailable

  try {
    const response = await fetch(`${env.OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(2000),
    })
    cachedOllamaAvailable = response.ok
  } catch {
    cachedOllamaAvailable = false
  }

  return cachedOllamaAvailable
}

function providerHasCredentials(provider: AiProviderName): boolean {
  switch (provider) {
    case 'groq':
      return hasKey(env.GROQ_API_KEY)
    case 'openai':
      return hasKey(env.OPENAI_API_KEY)
    case 'anthropic':
      return hasKey(env.ANTHROPIC_API_KEY)
    case 'gemini':
      return hasKey(env.GEMINI_API_KEY)
    case 'ollama':
      return env.OLLAMA_ENABLED
    case 'template':
      return env.AI_DEV_FALLBACK
    default:
      return false
  }
}

export async function resolveActiveProvider(): Promise<AiProviderName> {
  if (activeProviderCache) return activeProviderCache

  if (env.AI_PROVIDER !== 'auto') {
    const explicit = env.AI_PROVIDER

    if (explicit === 'ollama' && !(await isOllamaReachable())) {
      if (env.AI_DEV_FALLBACK) {
        activeProviderCache = 'template'
        return activeProviderCache
      }
      throw new AppError(
        'Ollama is not running. Start Ollama or add GROQ_API_KEY to server/.env',
        503,
      )
    }

    if (!providerHasCredentials(explicit)) {
      if (env.AI_DEV_FALLBACK) {
        activeProviderCache = 'template'
        return activeProviderCache
      }
      if (explicit === 'groq') {
        throw new AppError(
          'Add GROQ_API_KEY to server/.env. Get a free key at https://console.groq.com/keys',
          503,
        )
      }
      throw new AppError(`AI provider "${explicit}" is not configured.`, 503)
    }

    activeProviderCache = explicit
    return activeProviderCache
  }

  if (hasKey(env.GROQ_API_KEY)) {
    activeProviderCache = 'groq'
    return activeProviderCache
  }
  if (hasKey(env.GEMINI_API_KEY)) {
    activeProviderCache = 'gemini'
    return activeProviderCache
  }
  if (hasKey(env.OPENAI_API_KEY)) {
    activeProviderCache = 'openai'
    return activeProviderCache
  }
  if (hasKey(env.ANTHROPIC_API_KEY)) {
    activeProviderCache = 'anthropic'
    return activeProviderCache
  }
  if (await isOllamaReachable()) {
    activeProviderCache = 'ollama'
    return activeProviderCache
  }
  if (env.AI_DEV_FALLBACK) {
    activeProviderCache = 'template'
    return activeProviderCache
  }

  throw new AppError(
    'AI service is not configured. Add GROQ_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, start Ollama, or set AI_DEV_FALLBACK=true in server/.env',
    503,
  )
}

export async function isAiConfigured(): Promise<boolean> {
  try {
    await resolveActiveProvider()
    return true
  } catch {
    return false
  }
}

export function getAiStatusSync(): {
  configured: boolean
  provider: string
  providers: Record<string, boolean>
  devFallback: boolean
} {
  return {
    configured:
      hasKey(env.GROQ_API_KEY) ||
      hasKey(env.GEMINI_API_KEY) ||
      hasKey(env.OPENAI_API_KEY) ||
      hasKey(env.ANTHROPIC_API_KEY) ||
      env.OLLAMA_ENABLED ||
      env.AI_DEV_FALLBACK,
    provider: env.AI_PROVIDER,
    providers: {
      groq: hasKey(env.GROQ_API_KEY),
      gemini: hasKey(env.GEMINI_API_KEY),
      openai: hasKey(env.OPENAI_API_KEY),
      anthropic: hasKey(env.ANTHROPIC_API_KEY),
      ollama: env.OLLAMA_ENABLED,
      template: env.AI_DEV_FALLBACK,
    },
    devFallback: env.AI_DEV_FALLBACK,
  }
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 2,
): Promise<Response> {
  let lastResponse: Response | null = null

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const response = await fetch(url, init)
    lastResponse = response

    if (response.ok || !RETRYABLE_STATUS.has(response.status) || attempt === retries) {
      return response
    }

    const retryAfter = Number(response.headers.get('retry-after') ?? '0')
    const delayMs = retryAfter > 0 ? retryAfter * 1000 : (attempt + 1) * 1000
    await sleep(delayMs)
  }

  return lastResponse!
}

async function parseCompletionResponse(response: Response): Promise<string> {
  if (!response.ok) {
    const body = await response.text()
    if (response.status === 429) {
      throw new AppError('AI rate limit reached. Please wait and try again.', 429)
    }
    throw new AppError(`AI request failed (${response.status}): ${body.slice(0, 200)}`, 502)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new AppError('AI returned an empty response. Try again.', 502)
  }
  return content
}

async function callOpenAiCompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  maxTokens: number,
): Promise<string> {
  const response = await fetchWithRetry(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  })

  return parseCompletionResponse(response)
}

async function callAnthropic(messages: ChatMessage[], maxTokens: number): Promise<string> {
  if (!hasKey(env.ANTHROPIC_API_KEY)) {
    throw new AppError('ANTHROPIC_API_KEY is not configured.', 503)
  }

  const system = messages.find((message) => message.role === 'system')?.content ?? ''
  const conversation = messages.filter((message) => message.role !== 'system')

  const response = await fetchWithRetry('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      system,
      messages: conversation.map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content,
      })),
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    if (response.status === 429) {
      throw new AppError('AI rate limit reached. Please wait and try again.', 429)
    }
    throw new AppError(`AI request failed (${response.status}): ${body.slice(0, 200)}`, 502)
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>
  }
  const content = data.content
    ?.filter((block) => block.type === 'text')
    .map((block) => block.text ?? '')
    .join('\n')
    .trim()

  if (!content) {
    throw new AppError('AI returned an empty response. Try again.', 502)
  }
  return content
}

async function callGemini(messages: ChatMessage[], maxTokens: number): Promise<string> {
  if (!hasKey(env.GEMINI_API_KEY)) {
    throw new AppError('GEMINI_API_KEY is not configured.', 503)
  }

  const model = env.GEMINI_MODEL
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`
  const system = messages.find((message) => message.role === 'system')?.content
  const conversation = messages.filter((message) => message.role !== 'system')

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents: conversation.map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      })),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: maxTokens,
      },
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    if (response.status === 429) {
      throw new AppError('AI rate limit reached. Please wait and try again.', 429)
    }
    throw new AppError(`AI request failed (${response.status}): ${body.slice(0, 200)}`, 502)
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const content = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('\n')
    .trim()

  if (!content) {
    throw new AppError('AI returned an empty response. Try again.', 502)
  }
  return content
}

export async function generateAiCompletion(
  messages: ChatMessage[],
  maxTokens: number,
): Promise<string> {
  const provider = await resolveActiveProvider()
  const userPrompt = messages.find((message) => message.role === 'user')?.content ?? ''

  switch (provider) {
    case 'openai':
      return callOpenAiCompatible(
        env.OPENAI_BASE_URL,
        env.OPENAI_API_KEY,
        env.OPENAI_MODEL,
        messages,
        maxTokens,
      )
    case 'groq':
      return callOpenAiCompatible(
        env.GROQ_BASE_URL,
        env.GROQ_API_KEY,
        env.GROQ_MODEL,
        messages,
        maxTokens,
      )
    case 'ollama':
      return callOpenAiCompatible(
        `${env.OLLAMA_BASE_URL}/v1`,
        'ollama',
        env.OLLAMA_MODEL,
        messages,
        maxTokens,
      )
    case 'anthropic':
      return callAnthropic(messages, maxTokens)
    case 'gemini':
      return callGemini(messages, maxTokens)
    case 'template':
      return generateTemplateFallback(userPrompt, maxTokens)
    default:
      throw new AppError('Unsupported AI provider configuration.', 503)
  }
}
