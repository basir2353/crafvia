const SUPPORTED_EXTENSIONS = new Set([
  '.mp3',
  '.wav',
  '.aac',
  '.m4a',
  '.ogg',
  '.flac',
  '.wma',
  '.aiff',
  '.aif',
  '.opus',
])

export type AudioMetadata = {
  duration: number
  canPreview: boolean
}

export function getFileExtension(filename: string): string {
  const dot = filename.lastIndexOf('.')
  if (dot === -1) return ''
  return filename.slice(dot).toLowerCase()
}

export function isSupportedAudioFile(file: File): boolean {
  if (file.type.startsWith('audio/')) return true
  return SUPPORTED_EXTENSIONS.has(getFileExtension(file.name))
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return 'Unknown'
  const total = Math.floor(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`
}

function loadAudioMetadata(url: string): Promise<AudioMetadata> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio')
    audio.preload = 'metadata'

    const timeout = window.setTimeout(() => {
      reject(new Error('Audio metadata timed out.'))
    }, 15000)

    audio.onloadedmetadata = () => {
      window.clearTimeout(timeout)
      resolve({
        duration: audio.duration,
        canPreview: true,
      })
    }

    audio.onerror = () => {
      window.clearTimeout(timeout)
      reject(new Error('Could not read audio metadata.'))
    }

    audio.src = url
  })
}

export async function getAudioMetadata(file: File): Promise<AudioMetadata> {
  const url = URL.createObjectURL(file)
  try {
    return await loadAudioMetadata(url)
  } catch {
    return {
      duration: Number.NaN,
      canPreview: false,
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function buildInputFilename(file: File): string {
  const ext = getFileExtension(file.name)
  return `input${ext || '.mp3'}`
}

export function buildOutputFilename(file: File, suffix: string, ext: string): string {
  const base = file.name.replace(/\.[^.]+$/, '') || 'audio'
  return `${base}${suffix}${ext}`
}
