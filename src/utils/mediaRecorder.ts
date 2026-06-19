export function getRecorderMimeType(): string {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ]
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? 'video/webm'
}

export function extensionForMimeType(mimeType: string): string {
  return mimeType.includes('mp4') ? '.mp4' : '.webm'
}

export function parseMediaAccessError(err: unknown, device: 'camera' | 'screen'): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return device === 'camera'
        ? 'Camera permission denied. Allow camera and microphone access in your browser, then try again.'
        : 'Screen sharing permission denied. Choose a screen or window to record.'
    }
    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      return device === 'camera'
        ? 'No camera or microphone found. Connect a device and try again.'
        : 'No screen source available.'
    }
    if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      return device === 'camera'
        ? 'Camera is in use by another app. Close other apps using the camera and try again.'
        : 'Could not capture the screen. Try selecting a different source.'
    }
    if (err.name === 'OverconstrainedError') {
      return 'Camera settings are not supported by your device. Try a different browser.'
    }
    if (err.name === 'SecurityError') {
      return 'Camera access requires a secure connection (HTTPS).'
    }
  }

  if (err instanceof Error && err.message) return err.message
  return device === 'camera'
    ? 'Could not access the camera. Check permissions and try again.'
    : 'Could not start screen recording.'
}

export async function getWebcamStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new DOMException('NotSupportedError', 'Camera access is not supported in this browser.')
  }

  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user',
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
    },
  })
}

export async function getScreenStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new DOMException('NotSupportedError', 'Screen recording is not supported in this browser.')
  }

  return navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true,
  })
}

export async function attachStreamToVideo(
  video: HTMLVideoElement,
  stream: MediaStream,
): Promise<void> {
  video.srcObject = stream
  video.muted = true
  video.playsInline = true
  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => resolve(), 5000)
    video.onloadedmetadata = () => {
      window.clearTimeout(timeout)
      resolve()
    }
    video.onerror = () => {
      window.clearTimeout(timeout)
      reject(new Error('Could not display camera preview.'))
    }
  })
  await video.play().catch(() => {})
}

export function stopMediaStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop())
}

/** Collect chunks every second so stop always flushes data (Safari/Chrome). */
export const RECORDER_TIMESLICE_MS = 1000

export function stopMediaRecorder(recorder: MediaRecorder | null) {
  if (!recorder || recorder.state === 'inactive') return
  try {
    recorder.requestData()
  } catch {
    // ignore — not supported on all browsers
  }
  recorder.stop()
}

export function buildRecordingBlob(chunks: Blob[], mimeType: string): Blob {
  return new Blob(chunks, { type: mimeType.split(';')[0] ?? 'video/webm' })
}
