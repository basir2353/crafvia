export type WebSpeechOptions = {
  text: string
  lang?: string
  voiceUri?: string
  rate: number
  pitch: number
  volume: number
}

const VOICE_LOAD_TIMEOUT_MS = 3000
const VOICE_POLL_INTERVAL_MS = 100

export function isWebSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function readVoices(): SpeechSynthesisVoice[] {
  if (!isWebSpeechSupported()) return []
  return window.speechSynthesis.getVoices()
}

export function loadBrowserVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isWebSpeechSupported()) {
      resolve([])
      return
    }

    const initial = readVoices()
    if (initial.length > 0) {
      resolve(initial)
      return
    }

    let settled = false
    const finish = (voices: SpeechSynthesisVoice[]) => {
      if (settled) return
      settled = true
      cleanup()
      resolve(voices)
    }

    const cleanup = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged)
      window.clearInterval(pollTimer)
      window.clearTimeout(timeoutTimer)
    }

    const handleVoicesChanged = () => {
      const voices = readVoices()
      if (voices.length > 0) finish(voices)
    }

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged)
    window.speechSynthesis.getVoices()

    const pollTimer = window.setInterval(() => {
      const voices = readVoices()
      if (voices.length > 0) finish(voices)
    }, VOICE_POLL_INTERVAL_MS)

    const timeoutTimer = window.setTimeout(() => {
      finish(readVoices())
    }, VOICE_LOAD_TIMEOUT_MS)
  })
}

export function filterBrowserVoicesByLanguage(
  voices: SpeechSynthesisVoice[],
  languageCode: string,
): SpeechSynthesisVoice[] {
  const code = languageCode.toLowerCase()
  const exact = voices.filter((voice) => voice.lang.toLowerCase().startsWith(code))
  if (exact.length > 0) return exact
  return voices.filter((voice) => voice.lang.toLowerCase().startsWith(`${code}-`))
}

export function speakWithWebSpeech(options: WebSpeechOptions): void {
  if (!isWebSpeechSupported()) return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(options.text)
  utterance.rate = options.rate
  utterance.pitch = options.pitch
  utterance.volume = options.volume

  if (options.lang) {
    utterance.lang = options.lang
  }

  if (options.voiceUri) {
    const voice = readVoices().find((item) => item.voiceURI === options.voiceUri)
    if (voice) utterance.voice = voice
  }

  window.speechSynthesis.speak(utterance)
}

export function pauseWebSpeech(): void {
  if (isWebSpeechSupported()) {
    window.speechSynthesis.pause()
  }
}

export function resumeWebSpeech(): void {
  if (isWebSpeechSupported()) {
    window.speechSynthesis.resume()
  }
}

export function stopWebSpeech(): void {
  if (isWebSpeechSupported()) {
    window.speechSynthesis.cancel()
  }
}
