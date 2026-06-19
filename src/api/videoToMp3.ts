import type { AudioBitrate } from '../utils/videoToMp3'
import { convertVideoToMp3 } from '../utils/videoToMp3'
import type { VideoMetadata } from '../utils/videoInfo'

export type VideoToMp3Result = {
  blob: Blob
  filename: string
  originalSize: number
  outputSize: number
}

async function recordConversionJob(originalSize: number, outputSize: number) {
  const token = localStorage.getItem('crafvia_access_token')
  if (!token) return

  try {
    await fetch('/api/video/convert/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ originalSize, outputSize }),
    })
  } catch {
    // Job history is optional and should not block downloads.
  }
}

export async function convertVideoToMp3Api(
  file: File,
  bitrate: AudioBitrate,
  options?: {
    onStatus?: (message: string) => void
    onProgress?: (message: string) => void
    metadata?: VideoMetadata
  },
): Promise<VideoToMp3Result> {
  const result = await convertVideoToMp3(file, bitrate, options)
  void recordConversionJob(result.originalSize, result.outputSize)
  return result
}
