import { buildInputFilename, buildMp3Filename } from './videoInfo'
import { createVideoBlob, runFfmpegJob, type FfmpegCallbacks } from './ffmpegClient'

export type AudioBitrate = 64 | 128 | 192 | 256 | 320

export type ConvertToMp3Result = {
  blob: Blob
  filename: string
  originalSize: number
  outputSize: number
}

export async function convertVideoToMp3(
  file: File,
  bitrate: AudioBitrate,
  callbacks?: FfmpegCallbacks,
): Promise<ConvertToMp3Result> {
  const inputName = buildInputFilename(file)
  const outputName = 'output.mp3'

  const output = await runFfmpegJob(
    [{ name: inputName, file }],
    outputName,
    [
      '-i',
      inputName,
      '-vn',
      '-c:a',
      'libmp3lame',
      '-b:a',
      `${bitrate}k`,
      '-ar',
      '44100',
      outputName,
    ],
    callbacks,
  )

  const blob = createVideoBlob(output, 'audio/mpeg')

  return {
    blob,
    filename: buildMp3Filename(file),
    originalSize: file.size,
    outputSize: blob.size,
  }
}
