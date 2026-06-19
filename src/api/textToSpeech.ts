import {
  synthesizeSpeech,
  type SpeechPitch,
  type SpeechSpeed,
} from '../utils/textToSpeech'
import type { EdgeVoice } from '../utils/edgeTtsBrowser'
import type { GenderFilter } from '../utils/speechVoices'

export type TextToSpeechResult = {
  blob: Blob
  filename: string
  textLength: number
  voiceUsed: EdgeVoice
}

async function recordSpeechJob(textLength: number, outputSize: number) {
  const token = localStorage.getItem('crafvia_access_token')
  if (!token) return

  try {
    await fetch('/api/speech/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ textLength, outputSize }),
    })
  } catch {
    // Job history is optional and should not block downloads.
  }
}

export async function generateSpeechApi(
  text: string,
  voice: EdgeVoice,
  speed: SpeechSpeed,
  pitch: SpeechPitch,
  volume: number,
  options?: {
    allVoices?: EdgeVoice[]
    languageCode?: string
    gender?: GenderFilter
    languageAuto?: boolean
    onStatus?: (message: string) => void
  },
): Promise<TextToSpeechResult> {
  const result = await synthesizeSpeech({
    text,
    voice,
    speed,
    pitch,
    volume,
    allVoices: options?.allVoices,
    languageCode: options?.languageCode,
    gender: options?.gender,
    languageAuto: options?.languageAuto,
    onStatus: options?.onStatus,
  })

  void recordSpeechJob(text.trim().length, result.blob.size)

  return {
    blob: result.blob,
    filename: result.filename,
    voiceUsed: result.voiceUsed,
    textLength: text.trim().length,
  }
}
