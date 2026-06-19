import type { CompressResult } from './compress'
import { removeBackgroundFromImage } from '../utils/backgroundRemove'

export type RemoveBackgroundOptions = {
  file: File
  onProgress?: (message: string) => void
}

async function recordBackgroundJob(originalSize: number, outputSize: number) {
  const token = localStorage.getItem('crafvia_access_token')
  if (!token) return

  try {
    await fetch('/api/background/complete', {
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

export async function removeBackground({
  file,
  onProgress,
}: RemoveBackgroundOptions): Promise<CompressResult> {
  const result = await removeBackgroundFromImage(file, onProgress)
  void recordBackgroundJob(result.originalSize, result.compressedSize)
  return result
}
