import { env } from '../config/env.js'
import { AppError } from '../middleware/errorHandler.js'

function hasKey(value: string | undefined): boolean {
  return Boolean(value?.trim())
}

async function parseTranscriptionError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: { message?: string } | string }
    if (typeof data.error === 'string') return data.error
    if (data.error?.message) return data.error.message
  } catch {
    // fall through
  }
  return `Transcription service error (${response.status})`
}

async function transcribeWithProvider(
  baseUrl: string,
  apiKey: string,
  model: string,
  buffer: Buffer,
  filename: string,
  language?: string,
): Promise<string> {
  const form = new FormData()
  form.append('file', new Blob([new Uint8Array(buffer)]), filename)
  form.append('model', model)
  form.append('response_format', 'json')
  if (language) {
    form.append('language', language.split('-')[0])
  }

  const response = await fetch(`${baseUrl}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  })

  if (!response.ok) {
    throw new AppError(await parseTranscriptionError(response), response.status)
  }

  const data = (await response.json()) as { text?: string }
  const text = data.text?.trim()
  if (!text) {
    throw new AppError('No speech detected in the audio. Try a clearer recording.', 422)
  }
  return text
}

export function isSpeechTranscriptionConfigured(): boolean {
  return hasKey(env.GROQ_API_KEY) || hasKey(env.OPENAI_API_KEY)
}

export async function transcribeAudioBuffer(
  buffer: Buffer,
  filename: string,
  language = 'en',
): Promise<{ text: string; provider: string }> {
  if (hasKey(env.GROQ_API_KEY)) {
    const text = await transcribeWithProvider(
      env.GROQ_BASE_URL,
      env.GROQ_API_KEY,
      'whisper-large-v3',
      buffer,
      filename,
      language,
    )
    return { text, provider: 'groq' }
  }

  if (hasKey(env.OPENAI_API_KEY)) {
    const text = await transcribeWithProvider(
      env.OPENAI_BASE_URL,
      env.OPENAI_API_KEY,
      'whisper-1',
      buffer,
      filename,
      language,
    )
    return { text, provider: 'openai' }
  }

  throw new AppError(
    'Speech transcription is not configured. Add GROQ_API_KEY to server/.env (free at https://console.groq.com/keys).',
    503,
  )
}
