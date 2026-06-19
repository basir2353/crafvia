import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const CORE_VERSION = '0.12.6'
const CORE_BASE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`

export type FfmpegCallbacks = {
  onStatus?: (message: string) => void
  onProgress?: (message: string) => void
}

export type FfmpegInput = {
  name: string
  file: File | Uint8Array | string
}

export type FfmpegJobOptions = {
  /** Total output duration in seconds — enables log-based progress when FFmpeg progress stays at 0. */
  totalDurationSeconds?: number
}

let ffmpegInstance: FFmpeg | null = null
let ffmpegLoading: Promise<FFmpeg> | null = null

export async function getFfmpeg(callbacks?: FfmpegCallbacks): Promise<FFmpeg> {
  if (ffmpegInstance?.loaded) return ffmpegInstance

  if (!ffmpegLoading) {
    ffmpegLoading = (async () => {
      callbacks?.onStatus?.('Loading media engine…')
      const ffmpeg = new FFmpeg()
      await ffmpeg.load({
        coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
      })
      ffmpegInstance = ffmpeg
      return ffmpeg
    })()
  }

  return ffmpegLoading
}

export function createVideoBlob(data: Uint8Array, mimeType: string): Blob {
  const copy = new Uint8Array(data.length)
  copy.set(data)
  return new Blob([copy], { type: mimeType })
}

function parseLogTimeSeconds(message: string): number | null {
  const match = message.match(/time=(\d{2}):(\d{2}):(\d{2}[.\d]*)/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = Number(match[3])
  if (!Number.isFinite(hours + minutes + seconds)) return null
  return hours * 3600 + minutes * 60 + seconds
}

export async function runFfmpegJob(
  inputs: FfmpegInput[],
  outputName: string,
  args: string[],
  callbacks?: FfmpegCallbacks,
  options?: FfmpegJobOptions,
): Promise<Uint8Array> {
  const ffmpeg = await getFfmpeg(callbacks)
  let lastLog = ''
  let lastReportedPercent = -1

  const reportProgress = (percent: number, label = 'Processing') => {
    const clamped = Math.min(99, Math.max(0, Math.round(percent)))
    if (clamped !== lastReportedPercent) {
      lastReportedPercent = clamped
      callbacks?.onProgress?.(`${label}… ${clamped}%`)
    }
  }

  const logHandler = ({ message }: { message: string }) => {
    lastLog = message
    const totalDuration = options?.totalDurationSeconds
    if (totalDuration && totalDuration > 0) {
      const current = parseLogTimeSeconds(message)
      if (current !== null) {
        reportProgress((current / totalDuration) * 100)
      }
    }
  }

  const progressHandler = ({ progress }: { progress: number }) => {
    if (progress > 0) {
      const percent = Math.min(99, Math.max(0, Math.round(progress * 100)))
      if (percent !== lastReportedPercent) {
        lastReportedPercent = percent
        callbacks?.onProgress?.(`Processing… ${percent}%`)
      }
    }
  }

  ffmpeg.on('log', logHandler)
  ffmpeg.on('progress', progressHandler)

  const writtenFiles = [...inputs.map((input) => input.name), outputName]

  try {
    const fileInputs = inputs.filter((input) => input.file instanceof File)
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i]
      if (input.file instanceof File) {
        const fileIndex = fileInputs.indexOf(input) + 1
        callbacks?.onStatus?.(
          fileInputs.length > 1
            ? `Loading file ${fileIndex} of ${fileInputs.length}…`
            : 'Loading video…',
        )
      }
      const payload =
        input.file instanceof Uint8Array
          ? input.file
          : typeof input.file === 'string'
            ? input.file
            : await fetchFile(input.file)
      await ffmpeg.writeFile(input.name, payload)
    }

    callbacks?.onProgress?.('Processing… 0%')
    const exitCode = await ffmpeg.exec(args)

    if (exitCode !== 0) {
      throw new Error(parseFfmpegError(lastLog))
    }

    callbacks?.onStatus?.('Finalizing…')
    const output = await ffmpeg.readFile(outputName)
    if (!(output instanceof Uint8Array) || output.length === 0) {
      throw new Error('Processing failed. No output was generated.')
    }

    callbacks?.onProgress?.('Processing… 100%')
    return output
  } finally {
    ffmpeg.off('log', logHandler)
    ffmpeg.off('progress', progressHandler)
    for (const name of writtenFiles) {
      try {
        await ffmpeg.deleteFile(name)
      } catch {
        // ignore cleanup errors
      }
    }
  }
}

export function parseFfmpegError(log: string): string {
  const lower = log.toLowerCase()
  if (lower.includes('does not contain any stream') || lower.includes('no audio')) {
    return 'This video has no audio track.'
  }
  if (lower.includes('invalid data') || lower.includes('could not find codec')) {
    return 'Invalid or corrupted video file.'
  }
  if (lower.includes('memory') || lower.includes('out of memory')) {
    return 'File is too large for browser processing. Try smaller or lower-resolution videos.'
  }
  if (lower.includes('concat') || lower.includes('different parameters')) {
    return 'Videos have incompatible formats. Try converting them to MP4 first, or use shorter clips.'
  }
  if (lower.includes('timeout') || lower.includes('aborted')) {
    return 'Processing timed out. Try smaller videos or lower resolution.'
  }
  return 'Video processing failed. The file may be corrupted, too large, or unsupported.'
}
