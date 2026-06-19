import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal'
import type { CompressResult } from '../api/compress'
import { prepareImageForProcessing } from './imagePrepare'

function buildOutputFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '') || 'image'
  return `${base}-no-bg.png`
}

export async function removeBackgroundFromImage(
  file: File,
  onProgress?: (message: string) => void,
): Promise<CompressResult> {
  onProgress?.('Preparing image…')
  const prepared = await prepareImageForProcessing(file)

  try {
    onProgress?.('Removing background…')

    const resultBlob = await imglyRemoveBackground(prepared.file, {
      model: 'medium',
      output: {
        format: 'image/png',
        quality: 1,
      },
      progress: (key, current, total) => {
        if (total > 0) {
          const percent = Math.round((current / total) * 100)
          onProgress?.(
            key.includes('model') || key.includes('onnx')
              ? `Loading model (${percent}%)…`
              : `Removing background (${percent}%)…`,
          )
        }
      },
    })

    return {
      blob: resultBlob,
      originalSize: file.size,
      compressedSize: resultBlob.size,
      filename: buildOutputFilename(file.name),
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Background removal failed.'
    if (message.toLowerCase().includes('memory')) {
      throw new Error(
        'Image is too large to process. Try a smaller image or lower resolution.',
      )
    }
    throw new Error(message)
  } finally {
    URL.revokeObjectURL(prepared.previewUrl)
  }
}
