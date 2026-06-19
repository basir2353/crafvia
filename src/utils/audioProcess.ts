import {
  buildInputFilename,
  buildOutputFilename,
  getFileExtension,
  type AudioMetadata,
} from './audioInfo'
import { createVideoBlob, runFfmpegJob, type FfmpegCallbacks } from './ffmpegClient'

export type AudioProcessResult = {
  blob: Blob
  filename: string
  originalSize: number
  outputSize: number
}

export type Mp3Bitrate = 64 | 128 | 192 | 256 | 320

const OUT_MP3 = 'output.mp3'

function durationOrFallback(metadata: AudioMetadata | undefined, file: File): number {
  if (metadata?.duration && Number.isFinite(metadata.duration) && metadata.duration > 0) {
    return metadata.duration
  }
  return Math.max(10, file.size / (16 * 1024))
}

function mp3EncodeArgs(bitrate: Mp3Bitrate): string[] {
  return ['-map', '0:a:0?', '-vn', '-c:a', 'libmp3lame', '-b:a', `${bitrate}k`, '-ar', '44100']
}

function mimeForExtension(ext: string): string {
  switch (ext) {
    case '.mp3':
      return 'audio/mpeg'
    case '.wav':
      return 'audio/wav'
    case '.ogg':
      return 'audio/ogg'
    case '.m4a':
      return 'audio/mp4'
    case '.aac':
      return 'audio/aac'
    case '.flac':
      return 'audio/flac'
    default:
      return 'audio/mpeg'
  }
}

function toResult(
  file: File,
  data: Uint8Array,
  filename: string,
  mimeType: string,
): AudioProcessResult {
  const blob = createVideoBlob(data, mimeType)
  return {
    blob,
    filename,
    originalSize: file.size,
    outputSize: blob.size,
  }
}

function buildAtempoFilter(speed: number): string {
  if (speed === 1) return 'anull'
  const filters: string[] = []
  let remaining = speed
  while (remaining > 2.0) {
    filters.push('atempo=2.0')
    remaining /= 2
  }
  while (remaining < 0.5) {
    filters.push('atempo=0.5')
    remaining *= 2
  }
  filters.push(`atempo=${remaining.toFixed(4)}`)
  return filters.join(',')
}

export async function trimAudioFile(
  file: File,
  startSeconds: number,
  endSeconds: number,
  metadata?: AudioMetadata,
  callbacks?: FfmpegCallbacks,
): Promise<AudioProcessResult> {
  const inputName = buildInputFilename(file)
  const duration = metadata?.duration
  const start = Math.max(0, startSeconds)
  let end = endSeconds > start ? endSeconds : start + 1
  if (duration !== undefined && Number.isFinite(duration) && duration > 0) {
    end = Math.min(end, duration)
  }
  if (end <= start) throw new Error('End time must be after start time.')

  const clipDuration = end - start
  const outExt = getFileExtension(file.name) || '.mp3'
  const outName = `output${outExt}`

  try {
    const data = await runFfmpegJob(
      [{ name: inputName, file }],
      outName,
      [
        '-i',
        inputName,
        '-ss',
        String(start),
        '-to',
        String(end),
        '-map',
        '0:a:0?',
        '-c',
        'copy',
        '-avoid_negative_ts',
        'make_zero',
        outName,
      ],
      callbacks,
      { totalDurationSeconds: clipDuration },
    )
    return toResult(
      file,
      data,
      buildOutputFilename(file, '-trimmed', outExt),
      mimeForExtension(outExt),
    )
  } catch {
    callbacks?.onStatus?.('Re-encoding trimmed audio…')
  }

  const data = await runFfmpegJob(
    [{ name: inputName, file }],
    OUT_MP3,
    [
      '-ss',
      String(start),
      '-to',
      String(end),
      '-i',
      inputName,
      ...mp3EncodeArgs(192),
      OUT_MP3,
    ],
    callbacks,
    { totalDurationSeconds: clipDuration },
  )
  return toResult(file, data, buildOutputFilename(file, '-trimmed', '.mp3'), 'audio/mpeg')
}

export async function convertAudioToMp3(
  file: File,
  bitrate: Mp3Bitrate,
  metadata?: AudioMetadata,
  callbacks?: FfmpegCallbacks,
): Promise<AudioProcessResult> {
  const inputName = buildInputFilename(file)
  const data = await runFfmpegJob(
    [{ name: inputName, file }],
    OUT_MP3,
    ['-i', inputName, ...mp3EncodeArgs(bitrate), OUT_MP3],
    callbacks,
    { totalDurationSeconds: durationOrFallback(metadata, file) },
  )
  return toResult(file, data, buildOutputFilename(file, '', '.mp3'), 'audio/mpeg')
}

export async function normalizeAudioFile(
  file: File,
  metadata?: AudioMetadata,
  callbacks?: FfmpegCallbacks,
): Promise<AudioProcessResult> {
  const inputName = buildInputFilename(file)
  const data = await runFfmpegJob(
    [{ name: inputName, file }],
    OUT_MP3,
    [
      '-i',
      inputName,
      '-af',
      'dynaudnorm=f=150:g=15',
      ...mp3EncodeArgs(192),
      OUT_MP3,
    ],
    callbacks,
    { totalDurationSeconds: durationOrFallback(metadata, file) },
  )
  return toResult(file, data, buildOutputFilename(file, '-normalized', '.mp3'), 'audio/mpeg')
}

export async function mergeAudioFiles(
  files: File[],
  callbacks?: FfmpegCallbacks,
): Promise<AudioProcessResult> {
  if (files.length < 2) throw new Error('Add at least two audio files to merge.')

  const inputs = files.map((file, index) => ({
    name: `input${index}${getFileExtension(file.name) || '.mp3'}`,
    file,
  }))
  const concatLines = inputs.map((input) => `file '${input.name}'`).join('\n')

  callbacks?.onStatus?.('Trying fast merge…')
  try {
    const data = await runFfmpegJob(
      [...inputs, { name: 'concat.txt', file: concatLines }],
      OUT_MP3,
      ['-f', 'concat', '-safe', '0', '-i', 'concat.txt', '-map', '0:a:0?', '-c', 'copy', OUT_MP3],
      callbacks,
    )
    const originalSize = files.reduce((sum, f) => sum + f.size, 0)
    const blob = createVideoBlob(data, 'audio/mpeg')
    return { blob, filename: 'merged-audio.mp3', originalSize, outputSize: blob.size }
  } catch {
    callbacks?.onStatus?.('Re-encoding merged audio…')
  }

  const data = await runFfmpegJob(
    [...inputs, { name: 'concat.txt', file: concatLines }],
    OUT_MP3,
    ['-f', 'concat', '-safe', '0', '-i', 'concat.txt', '-map', '0:a:0?', ...mp3EncodeArgs(192), OUT_MP3],
    callbacks,
  )
  const originalSize = files.reduce((sum, f) => sum + f.size, 0)
  const blob = createVideoBlob(data, 'audio/mpeg')
  return { blob, filename: 'merged-audio.mp3', originalSize, outputSize: blob.size }
}

export async function changeAudioSpeed(
  file: File,
  speed: number,
  metadata?: AudioMetadata,
  callbacks?: FfmpegCallbacks,
): Promise<AudioProcessResult> {
  const inputName = buildInputFilename(file)
  const clamped = Math.min(3, Math.max(0.25, speed))
  const data = await runFfmpegJob(
    [{ name: inputName, file }],
    OUT_MP3,
    [
      '-i',
      inputName,
      '-af',
      buildAtempoFilter(clamped),
      ...mp3EncodeArgs(192),
      OUT_MP3,
    ],
    callbacks,
    {
      totalDurationSeconds: durationOrFallback(metadata, file) / clamped,
    },
  )
  return toResult(
    file,
    data,
    buildOutputFilename(file, `-${String(clamped).replace('.', '-')}x`, '.mp3'),
    'audio/mpeg',
  )
}

export async function fadeAudioFile(
  file: File,
  fadeInSeconds: number,
  fadeOutSeconds: number,
  metadata?: AudioMetadata,
  callbacks?: FfmpegCallbacks,
): Promise<AudioProcessResult> {
  const inputName = buildInputFilename(file)
  const duration =
    metadata?.duration && Number.isFinite(metadata.duration) && metadata.duration > 0
      ? metadata.duration
      : durationOrFallback(metadata, file)
  const fadeIn = Math.min(Math.max(0, fadeInSeconds), duration / 2)
  const fadeOut = Math.min(Math.max(0, fadeOutSeconds), duration / 2)
  const fadeOutStart = Math.max(0, duration - fadeOut)

  const filters: string[] = []
  if (fadeIn > 0) filters.push(`afade=t=in:st=0:d=${fadeIn}`)
  if (fadeOut > 0) filters.push(`afade=t=out:st=${fadeOutStart}:d=${fadeOut}`)
  const af = filters.length > 0 ? filters.join(',') : 'anull'

  const data = await runFfmpegJob(
    [{ name: inputName, file }],
    OUT_MP3,
    ['-i', inputName, '-af', af, ...mp3EncodeArgs(192), OUT_MP3],
    callbacks,
    { totalDurationSeconds: duration },
  )
  return toResult(file, data, buildOutputFilename(file, '-faded', '.mp3'), 'audio/mpeg')
}

export async function reverseAudioFile(
  file: File,
  metadata?: AudioMetadata,
  callbacks?: FfmpegCallbacks,
): Promise<AudioProcessResult> {
  const inputName = buildInputFilename(file)
  const data = await runFfmpegJob(
    [{ name: inputName, file }],
    OUT_MP3,
    ['-i', inputName, '-af', 'areverse', ...mp3EncodeArgs(192), OUT_MP3],
    callbacks,
    { totalDurationSeconds: durationOrFallback(metadata, file) },
  )
  return toResult(file, data, buildOutputFilename(file, '-reversed', '.mp3'), 'audio/mpeg')
}

export async function removeNoiseFromAudio(
  file: File,
  metadata?: AudioMetadata,
  callbacks?: FfmpegCallbacks,
): Promise<AudioProcessResult> {
  const inputName = buildInputFilename(file)

  try {
    const data = await runFfmpegJob(
      [{ name: inputName, file }],
      OUT_MP3,
      [
        '-i',
        inputName,
        '-af',
        'afftdn=nf=-25:nt=w',
        ...mp3EncodeArgs(192),
        OUT_MP3,
      ],
      callbacks,
      { totalDurationSeconds: durationOrFallback(metadata, file) },
    )
    return toResult(file, data, buildOutputFilename(file, '-denoised', '.mp3'), 'audio/mpeg')
  } catch {
    callbacks?.onStatus?.('Using band-pass noise reduction…')
  }

  const data = await runFfmpegJob(
    [{ name: inputName, file }],
    OUT_MP3,
    [
      '-i',
      inputName,
      '-af',
      'highpass=f=120,lowpass=f=10000',
      ...mp3EncodeArgs(192),
      OUT_MP3,
    ],
    callbacks,
    { totalDurationSeconds: durationOrFallback(metadata, file) },
  )
  return toResult(file, data, buildOutputFilename(file, '-denoised', '.mp3'), 'audio/mpeg')
}
