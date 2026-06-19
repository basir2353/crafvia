export type EdgeVoice = {
  Name: string
  ShortName: string
  Gender: string
  Locale: string
  FriendlyName: string
  Status: string
}

export type EdgeProsodyOptions = {
  rate: number | string
  pitch: string
  volume: number | string
}

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4'
const VOICES_URL = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=${TRUSTED_CLIENT_TOKEN}`
const WSS_URL =
  'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1'
const JSON_XML_DELIM = '\r\n\r\n'
const AUDIO_DELIM = 'Path:audio\r\n'
const OUTPUT_FORMAT_MP3 = 'audio-24khz-96kbitrate-mono-mp3'
const VOICE_LANG_REGEX = /\w{2}-\w{2}/

const encoder = new TextEncoder()
const AUDIO_DELIM_BYTES = encoder.encode(AUDIO_DELIM)

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

async function generateSecMsGec(trustedClientToken: string): Promise<string> {
  const ticks = Math.floor(Date.now() / 1000) + 11644473600
  const rounded = ticks - (ticks % 300)
  const windowsTicks = rounded * 10000000
  const data = encoder.encode(`${windowsTicks}${trustedClientToken}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

async function getSynthUrl(): Promise<string> {
  const requestId = generateUuid()
  const secMsGec = await generateSecMsGec(TRUSTED_CLIENT_TOKEN)
  return `${WSS_URL}?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=1-143.0.3650.96&ConnectionId=${requestId}`
}

function inferVoiceLocale(voiceName: string): string {
  const match = VOICE_LANG_REGEX.exec(voiceName)
  if (!match) {
    throw new Error('Could not infer voice locale from the selected voice.')
  }
  return match[0]
}

function indexOfSubarray(haystack: Uint8Array, needle: Uint8Array): number {
  for (let index = 0; index <= haystack.length - needle.length; index += 1) {
    let matched = true
    for (let offset = 0; offset < needle.length; offset += 1) {
      if (haystack[index + offset] !== needle[offset]) {
        matched = false
        break
      }
    }
    if (matched) return index
  }
  return -1
}

function buildSsml(
  input: string,
  voiceName: string,
  voiceLocale: string,
  options: EdgeProsodyOptions,
): string {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${voiceLocale}">
                <voice name="${voiceName}">
                    <prosody pitch="${options.pitch}" rate="${options.rate}" volume="${options.volume}">
                        ${input}
                    </prosody>
                </voice>
            </speak>`
}

function sendWhenOpen(ws: WebSocket, payload: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload)
      resolve()
      return
    }

    const handleOpen = () => {
      cleanup()
      ws.send(payload)
      resolve()
    }

    const handleError = () => {
      cleanup()
      reject(new Error('WebSocket connection failed'))
    }

    const cleanup = () => {
      ws.removeEventListener('open', handleOpen)
      ws.removeEventListener('error', handleError)
    }

    ws.addEventListener('open', handleOpen)
    ws.addEventListener('error', handleError)
  })
}

export async function fetchEdgeVoices(): Promise<EdgeVoice[]> {
  const response = await fetch(VOICES_URL)
  if (!response.ok) {
    throw new Error('Unable to load voices. Check your connection and try again.')
  }
  return response.json() as Promise<EdgeVoice[]>
}

class EdgeTtsSession {
  private ws: WebSocket | null = null
  private readonly outputFormat: string
  private connected = false

  constructor(outputFormat = OUTPUT_FORMAT_MP3) {
    this.outputFormat = outputFormat
  }

  async connect(): Promise<void> {
    if (this.connected && this.ws?.readyState === WebSocket.OPEN) return

    const synthUrl = await getSynthUrl()
    const ws = new WebSocket(synthUrl)
    ws.binaryType = 'arraybuffer'
    this.ws = ws

    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => {
        const speechConfig = `Content-Type:application/json; charset=utf-8\r\nPath:speech.config${JSON_XML_DELIM}
                    {
                        "context": {
                            "synthesis": {
                                "audio": {
                                    "metadataoptions": {
                                        "sentenceBoundaryEnabled": "false",
                                        "wordBoundaryEnabled": "false"
                                    },
                                    "outputFormat": "${this.outputFormat}"
                                }
                            }
                        }
                    }
                `
        ws.send(speechConfig)
        this.connected = true
        resolve()
      }

      ws.onerror = () => {
        reject(new Error('Failed to connect to speech service.'))
      }
    })
  }

  async synthesize(ssmlBody: string): Promise<Uint8Array> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connect()
    }

    const ws = this.ws!
    const requestId = randomHex(16)
    const request =
      `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml${JSON_XML_DELIM}` +
      ssmlBody.trim()

    return new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = []
      let settled = false

      const finish = (error?: Error) => {
        if (settled) return
        settled = true
        ws.removeEventListener('message', handleMessage)
        ws.removeEventListener('error', handleSocketError)
        ws.removeEventListener('close', handleClose)

        if (error) {
          reject(error)
          return
        }

        const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
        const merged = new Uint8Array(total)
        let offset = 0
        for (const chunk of chunks) {
          merged.set(chunk, offset)
          offset += chunk.length
        }
        resolve(merged)
      }

      const handleMessage = (event: MessageEvent<ArrayBuffer>) => {
        if (!(event.data instanceof ArrayBuffer)) return

        const buffer = new Uint8Array(event.data)
        const headerText = new TextDecoder().decode(
          buffer.subarray(0, Math.min(buffer.length, 512)),
        )
        const requestMatch = /X-RequestId:(.*?)\r\n/gm.exec(headerText)
        const messageRequestId = requestMatch?.[1]

        if (messageRequestId && messageRequestId !== requestId) return

        if (headerText.includes('Path:turn.end')) {
          finish()
          return
        }

        if (headerText.includes('Path:audio')) {
          const audioStart = indexOfSubarray(buffer, AUDIO_DELIM_BYTES)
          if (audioStart >= 0) {
            chunks.push(buffer.subarray(audioStart + AUDIO_DELIM_BYTES.length))
          }
        }
      }

      const handleSocketError = () => {
        finish(new Error('Speech synthesis connection failed.'))
      }

      const handleClose = () => {
        if (chunks.length > 0) {
          finish()
          return
        }
        finish(new Error('EMPTY_AUDIO'))
      }

      ws.addEventListener('message', handleMessage)
      ws.addEventListener('error', handleSocketError)
      ws.addEventListener('close', handleClose)

      void sendWhenOpen(ws, request).catch((error) => {
        finish(error instanceof Error ? error : new Error('Unable to send speech request.'))
      })
    })
  }

  close(): void {
    this.ws?.close()
    this.ws = null
    this.connected = false
  }
}

function buildVoiceSsml(
  text: string,
  voice: EdgeVoice,
  prosody: EdgeProsodyOptions,
): string {
  const locale = voice.Locale || inferVoiceLocale(voice.ShortName)
  return buildSsml(text, voice.ShortName, locale, prosody)
}

export async function synthesizeEdgeSpeechChunks(
  chunks: string[],
  voice: EdgeVoice,
  prosody: EdgeProsodyOptions,
): Promise<Uint8Array[]> {
  const session = new EdgeTtsSession()
  try {
    await session.connect()
    const audioParts: Uint8Array[] = []

    for (const chunk of chunks) {
      const ssml = buildVoiceSsml(chunk, voice, prosody)
      const audio = await session.synthesize(ssml)
      if (audio.length === 0) {
        throw new Error('EMPTY_AUDIO')
      }
      audioParts.push(audio)
    }

    return audioParts
  } finally {
    session.close()
  }
}
