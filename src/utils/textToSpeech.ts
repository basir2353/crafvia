import {
  fetchEdgeVoices,
  synthesizeEdgeSpeechChunks,
  type EdgeVoice,
} from './edgeTtsBrowser'
import {
  getVoiceFallbackChain,
  resolveLanguageForText,
  type GenderFilter,
} from './speechVoices'

export type { EdgeVoice as SpeechVoice }

export type SpeechSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2
export type SpeechPitch = 0.75 | 1 | 1.25

export type SynthesizeSpeechOptions = {
  text: string
  voice: EdgeVoice
  speed: SpeechSpeed
  pitch: SpeechPitch
  volume: number
  allVoices?: EdgeVoice[]
  languageCode?: string
  gender?: GenderFilter
  languageAuto?: boolean
  onStatus?: (message: string) => void
}

export type SynthesizeSpeechResult = {
  blob: Blob
  filename: string
  voiceUsed: EdgeVoice
}

export const MAX_TEXT_LENGTH = 5000
const MAX_CHUNK_LENGTH = 2000

const SENTENCE_BOUNDARY = /(?<=[.!?。！？۔؟\u0964\u0965])\s+/

let voicesCache: EdgeVoice[] | null = null
let voicesLoading: Promise<EdgeVoice[]> | null = null

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildFilename(text: string): string {
  const snippet = text.trim().slice(0, 40).replace(/[^\w\-]+/g, '-').replace(/-+/g, '-')
  return `${snippet || 'speech'}.mp3`
}

function formatRate(speed: SpeechSpeed): number {
  return speed
}

function formatPitch(pitch: SpeechPitch): string {
  const delta = Math.round((pitch - 1) * 100)
  return delta >= 0 ? `+${delta}%` : `${delta}%`
}

function formatVolume(volume: number): number {
  return Math.round(volume * 100)
}

function usesSpacelessScript(text: string): boolean {
  return /[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/.test(text)
}

function splitSpacelessText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text]

  const chunks: string[] = []
  for (let index = 0; index < text.length; index += maxLen) {
    chunks.push(text.slice(index, index + maxLen))
  }
  return chunks
}

function splitTextIntoChunks(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text]
  if (usesSpacelessScript(text)) return splitSpacelessText(text, maxLen)

  const chunks: string[] = []
  const paragraphs = text.split(/\n\n+/)
  let current = ''

  const flush = () => {
    const trimmed = current.trim()
    if (trimmed) chunks.push(trimmed)
    current = ''
  }

  const splitLongSegment = (segment: string) => {
    if (segment.length <= maxLen) {
      const next = current ? `${current} ${segment}` : segment
      if (next.length > maxLen) {
        flush()
        current = segment
      } else {
        current = next
      }
      return
    }

    const sentences = segment.split(SENTENCE_BOUNDARY).filter(Boolean)
    if (sentences.length <= 1) {
      for (let index = 0; index < segment.length; index += maxLen) {
        const part = segment.slice(index, index + maxLen)
        const next = current ? `${current} ${part}` : part
        if (next.length > maxLen) {
          flush()
          current = part
        } else {
          current = next
        }
      }
      return
    }

    for (const sentence of sentences) {
      splitLongSegment(sentence.trim())
    }
  }

  for (const paragraph of paragraphs) {
    if (paragraph.length > maxLen) {
      flush()
      splitLongSegment(paragraph)
      continue
    }

    const next = current ? `${current}\n\n${paragraph}` : paragraph
    if (next.length > maxLen) {
      flush()
      current = paragraph
    } else {
      current = next
    }
  }

  flush()
  return chunks.length > 0 ? chunks : [text]
}

export async function loadSpeechVoices(): Promise<EdgeVoice[]> {
  if (voicesCache) return voicesCache
  if (!voicesLoading) {
    voicesLoading = fetchEdgeVoices().then((voices) => {
      voicesCache = voices
      return voices
    })
  }
  return voicesLoading
}

async function trySynthesizeWithVoice(
  chunks: string[],
  voice: EdgeVoice,
  prosody: { rate: number; pitch: string; volume: number },
  onStatus?: (message: string) => void,
): Promise<Uint8Array[]> {
  const audioParts: Uint8Array[] = []

  for (let index = 0; index < chunks.length; index += 1) {
    if (chunks.length > 1) {
      onStatus?.(`Generating audio (${index + 1} of ${chunks.length})…`)
    }

    const part = await synthesizeEdgeSpeechChunks([chunks[index]], voice, prosody)
    if (part.length === 0 || part[0].length === 0) {
      throw new Error('EMPTY_AUDIO')
    }
    audioParts.push(part[0])
  }

  return audioParts
}

export async function synthesizeSpeech(
  options: SynthesizeSpeechOptions,
): Promise<SynthesizeSpeechResult> {
  const text = options.text.trim()
  if (!text) {
    throw new Error('Please enter some text to convert.')
  }

  if (text.length > MAX_TEXT_LENGTH) {
    throw new Error(`Text exceeds ${MAX_TEXT_LENGTH.toLocaleString()} character limit.`)
  }

  const allVoices = options.allVoices ?? (await loadSpeechVoices())
  const effectiveLanguage = resolveLanguageForText(
    text,
    options.languageCode ?? 'en',
    options.languageAuto ?? false,
  )

  const voiceChain = getVoiceFallbackChain(
    allVoices,
    effectiveLanguage,
    options.gender ?? 'all',
    options.voice,
  )

  if (voiceChain.length === 0) {
    throw new Error(
      `No compatible voices are available for ${effectiveLanguage.toUpperCase()}. Try another language.`,
    )
  }

  const chunks = splitTextIntoChunks(text, MAX_CHUNK_LENGTH).map(escapeXml)
  options.onStatus?.(
    chunks.length > 1
      ? `Generating audio (1 of ${chunks.length})…`
      : 'Generating audio…',
  )

  const prosody = {
    rate: formatRate(options.speed),
    pitch: formatPitch(options.pitch),
    volume: formatVolume(options.volume),
  }

  const errors: string[] = []

  for (let index = 0; index < voiceChain.length; index += 1) {
    const voice = voiceChain[index]
    if (index > 0) {
      options.onStatus?.(`Trying fallback voice (${index + 1}/${voiceChain.length})…`)
    }

    try {
      const audioParts = await trySynthesizeWithVoice(chunks, voice, prosody, options.onStatus)
      const totalLength = audioParts.reduce((sum, part) => sum + part.length, 0)
      const merged = new Uint8Array(totalLength)
      let offset = 0
      for (const part of audioParts) {
        merged.set(part, offset)
        offset += part.length
      }

      return {
        blob: new Blob([merged], { type: 'audio/mpeg' }),
        filename: buildFilename(text),
        voiceUsed: voice,
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message === 'EMPTY_AUDIO'
          ? `${voice.FriendlyName} returned no audio`
          : error instanceof Error
            ? error.message
            : 'Unknown synthesis error'
      errors.push(message)
    }
  }

  throw new Error(
    errors.length > 0
      ? `Speech generation failed for all available voices. ${errors[errors.length - 1]}`
      : 'Speech generation failed. Check your connection and try again.',
  )
}
