import JSZip from 'jszip'
import { buildInputFilename, buildOutputFilename } from './audioInfo'
import { createVideoBlob, runFfmpegJob, type FfmpegCallbacks } from './ffmpegClient'
import { minifySvg } from './compressProcess'

export type FileCompressResult = {
  blob: Blob
  filename: string
  originalSize: number
  outputSize: number
}

export type Mp3Bitrate = 64 | 96 | 128 | 192

const OUT_MP3 = 'output.mp3'

export async function compressAudioToMp3(
  file: File,
  bitrate: Mp3Bitrate,
  callbacks?: FfmpegCallbacks,
): Promise<FileCompressResult> {
  const inputName = buildInputFilename(file)
  const data = await runFfmpegJob(
    [{ name: inputName, file }],
    OUT_MP3,
    [
      '-i',
      inputName,
      '-map',
      '0:a:0?',
      '-vn',
      '-c:a',
      'libmp3lame',
      '-b:a',
      `${bitrate}k`,
      '-ar',
      '44100',
      OUT_MP3,
    ],
    callbacks,
    { totalDurationSeconds: Math.max(10, file.size / (16 * 1024)) },
  )

  const blob = createVideoBlob(data, 'audio/mpeg')
  return {
    blob,
    filename: buildOutputFilename(file, '-compressed', '.mp3'),
    originalSize: file.size,
    outputSize: blob.size,
  }
}

export function optimizeSvgFile(content: string): { output: string; originalSize: number; outputSize: number } {
  const output = minifySvg(content)
  const originalSize = new Blob([content]).size
  const outputSize = new Blob([output]).size
  return { output, originalSize, outputSize }
}

export async function createZipArchive(files: File[]): Promise<FileCompressResult> {
  if (!files.length) throw new Error('Select at least one file.')

  const zip = new JSZip()
  let originalSize = 0
  for (const file of files) {
    originalSize += file.size
    const buffer = await file.arrayBuffer()
    zip.file(file.name, buffer)
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  const stamp = new Date().toISOString().slice(0, 10)
  return {
    blob,
    filename: `archive-${stamp}.zip`,
    originalSize,
    outputSize: blob.size,
  }
}
