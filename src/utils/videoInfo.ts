const SUPPORTED_EXTENSIONS = new Set([
  '.mp4',
  '.mov',
  '.avi',
  '.mkv',
  '.webm',
  '.m4v',
  '.flv',
  '.mpeg',
  '.mpg',
  '.3gp',
  '.wmv',
])

export type VideoMetadata = {
  duration: number
  width: number
  height: number
  canPreview: boolean
}

export function getFileExtension(filename: string): string {
  const dot = filename.lastIndexOf('.')
  if (dot === -1) return ''
  return filename.slice(dot).toLowerCase()
}

export function isSupportedVideoFile(file: File): boolean {
  if (file.type.startsWith('video/')) return true
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

export function formatResolution(width: number, height: number): string {
  if (width > 0 && height > 0) return `${width} × ${height}`
  return 'Unknown'
}

function loadVideoMetadata(url: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'

    const timeout = window.setTimeout(() => {
      reject(new Error('Video metadata timed out.'))
    }, 15000)

    video.onloadedmetadata = () => {
      window.clearTimeout(timeout)
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        canPreview: true,
      })
    }

    video.onerror = () => {
      window.clearTimeout(timeout)
      reject(new Error('Could not read video metadata.'))
    }

    video.src = url
  })
}

export async function getVideoMetadata(file: File): Promise<VideoMetadata> {
  const url = URL.createObjectURL(file)
  try {
    return await loadVideoMetadata(url)
  } catch {
    return {
      duration: Number.NaN,
      width: 0,
      height: 0,
      canPreview: false,
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function buildInputFilename(file: File): string {
  const ext = getFileExtension(file.name)
  return `input${ext || '.mp4'}`
}

export function buildMp3Filename(file: File): string {
  const base = file.name.replace(/\.[^.]+$/, '') || 'audio'
  return `${base}.mp3`
}
