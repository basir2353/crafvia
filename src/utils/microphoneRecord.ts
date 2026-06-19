export function isMicrophoneSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== 'undefined'
  )
}

export class MicrophoneRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private stream: MediaStream | null = null
  private chunks: Blob[] = []

  async start(): Promise<void> {
    if (!isMicrophoneSupported()) {
      throw new Error('Microphone recording is not supported in this browser.')
    }

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    this.chunks = []

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : ''

    this.mediaRecorder = mimeType
      ? new MediaRecorder(this.stream, { mimeType })
      : new MediaRecorder(this.stream)

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.chunks.push(event.data)
    }

    this.mediaRecorder.start()
  }

  async stop(): Promise<{ blob: Blob; filename: string }> {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      throw new Error('Recording is not active.')
    }

    return new Promise((resolve, reject) => {
      const recorder = this.mediaRecorder!
      recorder.onerror = () => reject(new Error('Recording failed. Please try again.'))
      recorder.onstop = () => {
        const type = recorder.mimeType || 'audio/webm'
        const blob = new Blob(this.chunks, { type })
        this.cleanup()
        resolve({
          blob,
          filename: type.includes('webm') ? 'recording.webm' : 'recording.audio',
        })
      }
      recorder.stop()
    })
  }

  cancel(): void {
    this.cleanup()
  }

  private cleanup() {
    this.mediaRecorder = null
    this.chunks = []
    if (this.stream) {
      for (const track of this.stream.getTracks()) track.stop()
      this.stream = null
    }
  }
}
