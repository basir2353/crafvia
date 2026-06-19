type SpeechRecognitionCtor = new () => SpeechRecognitionLike

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: {
    length: number
    [index: number]: {
      isFinal: boolean
      [index: number]: { transcript: string }
    }
  }
}

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  const win = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognition() !== null
}

export type LiveTranscriptionCallbacks = {
  onPartial?: (text: string) => void
  onFinal?: (text: string) => void
  onError?: (message: string) => void
  onEnd?: () => void
}

export class LiveTranscriptionSession {
  private recognition: SpeechRecognitionLike | null = null
  private finalParts: string[] = []
  private active = false
  private lang = 'en-US'
  private callbacks: LiveTranscriptionCallbacks | undefined

  start(lang = 'en-US', callbacks?: LiveTranscriptionCallbacks): boolean {
    const Ctor = getSpeechRecognition()
    if (!Ctor) {
      callbacks?.onError?.('Speech recognition is not supported in this browser. Try Chrome or Edge.')
      return false
    }

    this.lang = lang
    this.callbacks = callbacks
    this.finalParts = []
    this.active = true
    this.attachRecognition(new Ctor())
    return true
  }

  private attachRecognition(recognition: SpeechRecognitionLike) {
    this.recognition = recognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = this.lang

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0]?.transcript ?? ''
        if (result.isFinal) {
          if (text.trim()) this.finalParts.push(text.trim())
          this.callbacks?.onFinal?.(this.getTranscript())
        } else {
          interim += text
        }
      }
      if (interim) {
        this.callbacks?.onPartial?.(`${this.getTranscript()} ${interim}`.trim())
      }
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return
      this.active = false
      this.callbacks?.onError?.(
        event.error === 'not-allowed'
          ? 'Microphone permission denied. Allow microphone access and try again.'
          : `Speech recognition error: ${event.error}`,
      )
    }

    recognition.onend = () => {
      if (this.active) {
        const Ctor = getSpeechRecognition()
        if (!Ctor) {
          this.active = false
          this.callbacks?.onEnd?.()
          return
        }
        try {
          this.attachRecognition(new Ctor())
          this.recognition?.start()
        } catch {
          this.active = false
          this.callbacks?.onEnd?.()
        }
        return
      }
      this.callbacks?.onEnd?.()
    }

    recognition.start()
  }

  stop() {
    this.active = false
    this.recognition?.stop()
  }

  abort() {
    this.active = false
    this.recognition?.abort()
    this.recognition = null
  }

  getTranscript(): string {
    return this.finalParts.join(' ').replace(/\s+/g, ' ').trim()
  }
}

export async function transcribeAudioPlayback(
  audioUrl: string,
  lang = 'en-US',
  callbacks?: LiveTranscriptionCallbacks,
): Promise<string> {
  if (!getSpeechRecognition()) {
    throw new Error('Speech recognition is not supported in this browser. Try Chrome or Edge.')
  }

  return new Promise((resolve, reject) => {
    const session = new LiveTranscriptionSession()
    const audio = document.createElement('audio')
    audio.src = audioUrl
    audio.preload = 'auto'

    let finished = false

    const finish = (text: string) => {
      if (finished) return
      finished = true
      session.stop()
      audio.pause()
      if (!text.trim()) {
        reject(
          new Error(
            'No speech detected. Try Live microphone mode, or use a clearer recording in Chrome/Edge.',
          ),
        )
        return
      }
      resolve(text)
    }

    const fail = (message: string) => {
      if (finished) return
      finished = true
      session.abort()
      audio.pause()
      reject(new Error(message))
    }

    if (
      !session.start(lang, {
        onPartial: callbacks?.onPartial,
        onFinal: (text) => callbacks?.onFinal?.(text),
        onError: (message) => fail(message),
      })
    ) {
      fail('Could not start speech recognition. Allow microphone access and try again.')
      return
    }

    audio.onended = () => {
      window.setTimeout(() => finish(session.getTranscript()), 1000)
    }

    audio.onerror = () => fail('Could not play audio file for transcription.')

    void audio.play().catch(() => {
      fail('Could not play audio. Check file format and try again.')
    })
  })
}
