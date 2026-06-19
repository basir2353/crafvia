import { apiFetch } from './client'

export type SpeechTranscribeLimits = {
  plan: 'FREE' | 'PRO'
  maxFileMb: number
  dailyJobs: number
  configured: boolean
}

export async function fetchSpeechTranscribeLimits() {
  return apiFetch<SpeechTranscribeLimits>('/api/speech/limits')
}

export async function transcribeAudioFile(
  file: File | Blob,
  filename: string,
  language = 'en',
): Promise<string> {
  const form = new FormData()
  form.append('file', file, filename)
  form.append('language', language)

  const data = await apiFetch<{ text: string }>('/api/speech/transcribe', {
    method: 'POST',
    body: form,
  })

  return data.text
}
