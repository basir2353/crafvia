import sharp from 'sharp'
import { env } from '../config/env.js'
import { AppError } from '../middleware/errorHandler.js'
import { fetchWithRetryExport, getGeminiApiKey, hasKey } from './aiImageUtils.js'

export type ImageAspectRatio = '1:1' | '16:9' | '9:16' | '4:3'

export type ImageGenerateResult = {
  imageBase64: string
  mimeType: string
  provider: string
  fallback: boolean
  width: number
  height: number
}

type ImageProviderName = 'openai' | 'gemini' | 'huggingface' | 'template'

function resolveDimensions(aspect: ImageAspectRatio): { width: number; height: number; openAiSize: string } {
  switch (aspect) {
    case '16:9':
      return { width: 1792, height: 1024, openAiSize: '1792x1024' }
    case '9:16':
      return { width: 1024, height: 1792, openAiSize: '1024x1792' }
    case '4:3':
      return { width: 1024, height: 768, openAiSize: '1024x1024' }
    default:
      return { width: 1024, height: 1024, openAiSize: '1024x1024' }
  }
}

function geminiAspectRatio(aspect: ImageAspectRatio): string {
  switch (aspect) {
    case '16:9':
      return '16:9'
    case '9:16':
      return '9:16'
    case '4:3':
      return '4:3'
    default:
      return '1:1'
  }
}

function geminiKey(): string {
  return getGeminiApiKey(env.GOOGLE_API_KEY, env.GEMINI_API_KEY)
}

function geminiImageApiError(status: number, body: string): AppError {
  if (status === 429) {
    if (
      body.includes('limit: 0') ||
      body.includes('free_tier') ||
      body.includes('RESOURCE_EXHAUSTED')
    ) {
      return new AppError(
        'Gemini image generation requires billing on your Google AI Studio project (free tier image quota is 0). Open https://aistudio.google.com, select your project, enable Billing, then retry.',
        429,
      )
    }
    const retryMatch = body.match(/retry in ([\d.]+)s/i)
    const retryHint = retryMatch
      ? ` Retry in about ${Math.ceil(Number(retryMatch[1]))} seconds.`
      : ''
    return new AppError(`Gemini rate limit exceeded.${retryHint}`, 429)
  }
  return new AppError(`Gemini image generation failed (${status}): ${body.slice(0, 300)}`, 502)
}

function resolveImageProvider(): ImageProviderName | null {
  const explicit = env.IMAGE_PROVIDER

  if (explicit === 'openai') return hasKey(env.OPENAI_API_KEY) ? 'openai' : null
  if (explicit === 'gemini') return hasKey(geminiKey()) ? 'gemini' : null
  if (explicit === 'huggingface') return hasKey(env.HUGGINGFACE_API_KEY) ? 'huggingface' : null

  if (hasKey(env.OPENAI_API_KEY)) return 'openai'
  if (hasKey(geminiKey())) return 'gemini'
  if (hasKey(env.HUGGINGFACE_API_KEY)) return 'huggingface'
  return null
}

function imageNotConfiguredError(): AppError {
  return new AppError(
    'Image generation requires GEMINI_API_KEY (free at https://aistudio.google.com/apikey), OPENAI_API_KEY, or HUGGINGFACE_API_KEY in server/.env. Groq only supports text — it cannot generate images.',
    503,
  )
}

function hashPromptSeed(prompt: string): number {
  let hash = 0
  for (let i = 0; i < prompt.length; i += 1) {
    hash = (hash * 31 + prompt.charCodeAt(i)) >>> 0
  }
  return hash
}

function buildPromptArtSvg(prompt: string, width: number, height: number): string {
  const seed = hashPromptSeed(prompt)
  const hue1 = seed % 360
  const hue2 = (hue1 + 60 + (seed % 120)) % 360
  const hue3 = (hue2 + 80) % 360
  const title = prompt.trim().slice(0, 80).replace(/[<>&"]/g, '')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(${hue1}, 70%, 45%)"/>
      <stop offset="50%" stop-color="hsl(${hue2}, 65%, 38%)"/>
      <stop offset="100%" stop-color="hsl(${hue3}, 75%, 32%)"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(width / 24)}" fill="rgba(255,255,255,0.85)">Preview placeholder — add an image API key</text>
  <text x="${width / 2}" y="${height * 0.88}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(width / 32)}" fill="rgba(255,255,255,0.7)">${title || 'Generated Art'}</text>
</svg>`
}

async function generateFallbackImage(prompt: string, width: number, height: number): Promise<Buffer> {
  const svg = buildPromptArtSvg(prompt, width, height)
  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function generateOpenAiImage(
  prompt: string,
  size: string,
): Promise<{ buffer: Buffer; mimeType: string }> {
  const response = await fetchWithRetryExport(`${env.OPENAI_BASE_URL}/images/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.OPENAI_IMAGE_MODEL,
      prompt,
      n: 1,
      size,
      response_format: 'b64_json',
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    if (response.status === 429) {
      throw new AppError('AI rate limit reached. Please wait and try again.', 429)
    }
    throw new AppError(`OpenAI image generation failed (${response.status}): ${body.slice(0, 200)}`, 502)
  }

  const data = (await response.json()) as {
    data?: Array<{ b64_json?: string }>
  }
  const b64 = data.data?.[0]?.b64_json
  if (!b64) {
    throw new AppError('OpenAI returned no image data. Try again.', 502)
  }

  return { buffer: Buffer.from(b64, 'base64'), mimeType: 'image/png' }
}

async function generateGeminiImage(
  prompt: string,
  aspectRatio: ImageAspectRatio,
): Promise<{ buffer: Buffer; mimeType: string }> {
  const apiKey = geminiKey()
  if (!hasKey(apiKey)) {
    throw new AppError('GEMINI_API_KEY or GOOGLE_API_KEY is not configured.', 503)
  }

  const model = env.GEMINI_IMAGE_MODEL
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const response = await fetchWithRetryExport(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio: geminiAspectRatio(aspectRatio) },
      },
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw geminiImageApiError(response.status, body)
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> }
    }>
  }

  for (const part of data.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData?.data) {
      return {
        buffer: Buffer.from(part.inlineData.data, 'base64'),
        mimeType: part.inlineData.mimeType ?? 'image/png',
      }
    }
  }

  throw new AppError('Gemini returned no image. Try a different prompt or model.', 502)
}

async function generateHuggingFaceImage(
  prompt: string,
): Promise<{ buffer: Buffer; mimeType: string }> {
  if (!hasKey(env.HUGGINGFACE_API_KEY)) {
    throw new AppError('HUGGINGFACE_API_KEY is not configured.', 503)
  }

  const model = env.HF_IMAGE_MODEL
  const url = `https://router.huggingface.co/hf-inference/models/${model}`

  const response = await fetchWithRetryExport(
    url,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    },
    4,
  )

  if (!response.ok) {
    const body = await response.text()
    if (response.status === 503) {
      throw new AppError('HuggingFace model is loading. Wait a moment and try again.', 503)
    }
    throw new AppError(`HuggingFace image generation failed (${response.status}): ${body.slice(0, 200)}`, 502)
  }

  const mimeType = response.headers.get('content-type')?.split(';')[0] ?? 'image/jpeg'
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length < 100) {
    throw new AppError('HuggingFace returned an invalid image response.', 502)
  }

  return { buffer, mimeType }
}

async function generateWithProvider(
  provider: ImageProviderName,
  prompt: string,
  aspectRatio: ImageAspectRatio,
  openAiSize: string,
): Promise<{ buffer: Buffer; mimeType: string }> {
  switch (provider) {
    case 'openai':
      return generateOpenAiImage(prompt, openAiSize)
    case 'gemini':
      return generateGeminiImage(prompt, aspectRatio)
    case 'huggingface':
      return generateHuggingFaceImage(prompt)
    default:
      throw imageNotConfiguredError()
  }
}

export async function generateAiImage(
  prompt: string,
  aspectRatio: ImageAspectRatio = '1:1',
): Promise<ImageGenerateResult> {
  const trimmed = prompt.trim()
  if (!trimmed) throw new AppError('Please enter an image prompt.', 400)
  if (trimmed.length > 1000) throw new AppError('Prompt must be 1000 characters or fewer.', 400)

  const { width, height, openAiSize } = resolveDimensions(aspectRatio)
  const provider = resolveImageProvider()

  if (!provider) {
    if (env.AI_DEV_FALLBACK) {
      const buffer = await generateFallbackImage(trimmed, width, height)
      return {
        imageBase64: buffer.toString('base64'),
        mimeType: 'image/png',
        provider: 'template',
        fallback: true,
        width,
        height,
      }
    }
    throw imageNotConfiguredError()
  }

  if (env.IMAGE_PROVIDER !== 'auto' && !resolveImageProvider()) {
    throw imageNotConfiguredError()
  }

  const providersToTry: ImageProviderName[] =
    env.IMAGE_PROVIDER === 'auto'
      ? (['openai', 'gemini', 'huggingface'] as const).filter((name) => {
          if (name === 'openai') return hasKey(env.OPENAI_API_KEY)
          if (name === 'gemini') return hasKey(geminiKey())
          if (name === 'huggingface') return hasKey(env.HUGGINGFACE_API_KEY)
          return false
        })
      : [provider]

  let lastError: unknown = null

  for (const name of providersToTry) {
    try {
      const { buffer, mimeType } = await generateWithProvider(name, trimmed, aspectRatio, openAiSize)
      return {
        imageBase64: buffer.toString('base64'),
        mimeType,
        provider: name,
        fallback: false,
        width,
        height,
      }
    } catch (error) {
      lastError = error
      if (error instanceof AppError && (error.status === 429 || error.status === 503)) {
        throw error
      }
      if (providersToTry.length === 1) break
    }
  }

  if (lastError instanceof AppError) throw lastError

  if (env.AI_DEV_FALLBACK) {
    const buffer = await generateFallbackImage(trimmed, width, height)
    return {
      imageBase64: buffer.toString('base64'),
      mimeType: 'image/png',
      provider: 'template',
      fallback: true,
      width,
      height,
    }
  }

  if (lastError instanceof AppError) throw lastError
  throw new AppError('Image generation failed. Please try again.', 502)
}

