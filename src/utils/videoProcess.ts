import {
  buildInputFilename,
  type VideoMetadata,
} from './videoInfo'
import {
  buildCompressionProfile,
  buildCompressFfmpegArgs,
  buildFastMergeVideoArgs,
  buildReencodeFfmpegArgs,
  buildReencodeProfile,
  buildStreamCopyArgs,
  buildTrimCopyArgs,
  buildBitrateVideoArgs,
  buildAudioArgs,
  tightenCompressionProfile,
  type CompressionProfile,
} from './videoEncode'
import { prepareSubtitleForFfmpeg } from './subtitleFile'
import { createVideoBlob, runFfmpegJob, type FfmpegCallbacks } from './ffmpegClient'

export type VideoProcessResult = {
  blob: Blob
  filename: string
  originalSize: number
  outputSize: number
}

/** Max width/height used when merging in browser — keeps wasm processing feasible. */
const MERGE_TARGET_WIDTH = 1280
const MERGE_TARGET_HEIGHT = 720

const MIN_SIZE_REDUCTION = 0.97

function outputName(ext: string): string {
  return `output${ext}`
}

function buildOutputFilename(file: File, ext: string): string {
  const base = file.name.replace(/\.[^.]+$/, '') || 'video'
  return `${base}${ext}`
}

function toResult(
  file: File,
  data: Uint8Array,
  filename: string,
  mimeType: string,
): VideoProcessResult {
  const blob = createVideoBlob(data, mimeType)
  return {
    blob,
    filename,
    originalSize: file.size,
    outputSize: blob.size,
  }
}

function totalDurationSeconds(metadata: VideoMetadata | undefined, fallback: number): number {
  if (metadata?.duration && Number.isFinite(metadata.duration) && metadata.duration > 0) {
    return metadata.duration
  }
  return fallback
}

function buildMergeFilterComplex(count: number, withAudio: boolean): string {
  const parts: string[] = []
  const concatInputs: string[] = []

  for (let i = 0; i < count; i++) {
    parts.push(
      `[${i}:v]scale=${MERGE_TARGET_WIDTH}:${MERGE_TARGET_HEIGHT}:force_original_aspect_ratio=decrease,pad=${MERGE_TARGET_WIDTH}:${MERGE_TARGET_HEIGHT}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,format=yuv420p[v${i}]`,
    )
    if (withAudio) {
      parts.push(
        `[${i}:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo[a${i}]`,
      )
      concatInputs.push(`[v${i}][a${i}]`)
    } else {
      concatInputs.push(`[v${i}]`)
    }
  }

  if (withAudio) {
    parts.push(`${concatInputs.join('')}concat=n=${count}:v=1:a=1[outv][outa]`)
  } else {
    parts.push(`${concatInputs.join('')}concat=n=${count}:v=1:a=0[outv]`)
  }

  return parts.join(';')
}

async function runCompressPass(
  file: File,
  profile: CompressionProfile,
  metadata: VideoMetadata | undefined,
  callbacks?: FfmpegCallbacks,
): Promise<Uint8Array> {
  const inputName = buildInputFilename(file)
  const outName = outputName('.mp4')
  const args = buildCompressFfmpegArgs(inputName, outName, profile)

  try {
    return await runFfmpegJob(
      [{ name: inputName, file }],
      outName,
      args,
      callbacks,
      { totalDurationSeconds: totalDurationSeconds(metadata, 120) },
    )
  } catch (firstError) {
    if (!profile.tryAudioCopy) throw firstError
    callbacks?.onStatus?.('Retrying with re-encoded audio…')
    const retryProfile = { ...profile, tryAudioCopy: false }
    return runFfmpegJob(
      [{ name: inputName, file }],
      outName,
      buildCompressFfmpegArgs(inputName, outName, retryProfile),
      callbacks,
      { totalDurationSeconds: totalDurationSeconds(metadata, 120) },
    )
  }
}

export async function trimVideoFile(
  file: File,
  startSeconds: number,
  endSeconds: number,
  metadata?: VideoMetadata,
  callbacks?: FfmpegCallbacks,
): Promise<VideoProcessResult> {
  const inputName = buildInputFilename(file)
  const outName = outputName('.mp4')
  const duration = metadata?.duration
  const start = Math.max(0, startSeconds)
  let end = endSeconds > start ? endSeconds : start + 1

  if (duration !== undefined && Number.isFinite(duration) && duration > 0) {
    end = Math.min(end, duration)
  }

  if (end <= start) {
    throw new Error('End time must be after start time.')
  }

  const clipDuration = end - start

  callbacks?.onStatus?.('Trimming…')
  try {
    const data = await runFfmpegJob(
      [{ name: inputName, file }],
      outName,
      buildTrimCopyArgs(inputName, outName, start, end),
      callbacks,
      { totalDurationSeconds: clipDuration },
    )
    return toResult(file, data, buildOutputFilename(file, '-trimmed.mp4'), 'video/mp4')
  } catch {
    callbacks?.onStatus?.('Re-encoding trimmed clip…')
  }

  const profile = buildReencodeProfile(file, metadata, {})
  const data = await runFfmpegJob(
    [{ name: inputName, file }],
    outName,
    [
      '-ss',
      String(start),
      '-to',
      String(end),
      '-i',
      inputName,
      ...buildBitrateVideoArgs(profile.targetVideoKbps, profile.preset),
      ...buildAudioArgs(profile),
      '-movflags',
      '+faststart',
      outName,
    ],
    callbacks,
    { totalDurationSeconds: clipDuration },
  )

  return toResult(file, data, buildOutputFilename(file, '-trimmed.mp4'), 'video/mp4')
}

export async function convertVideoToMp4(
  file: File,
  metadata?: VideoMetadata,
  callbacks?: FfmpegCallbacks,
): Promise<VideoProcessResult> {
  const inputName = buildInputFilename(file)
  const outName = outputName('.mp4')

  callbacks?.onStatus?.('Converting…')
  try {
    const data = await runFfmpegJob(
      [{ name: inputName, file }],
      outName,
      buildStreamCopyArgs(inputName, outName),
      callbacks,
      { totalDurationSeconds: totalDurationSeconds(metadata, 120) },
    )
    return toResult(file, data, buildOutputFilename(file, '.mp4'), 'video/mp4')
  } catch {
    callbacks?.onStatus?.('Re-encoding to MP4…')
  }

  const profile = buildReencodeProfile(file, metadata, {})
  const data = await runFfmpegJob(
    [{ name: inputName, file }],
    outName,
    buildReencodeFfmpegArgs(inputName, outName, profile),
    callbacks,
    { totalDurationSeconds: totalDurationSeconds(metadata, 120) },
  )

  return toResult(file, data, buildOutputFilename(file, '.mp4'), 'video/mp4')
}

export async function compressVideoFile(
  file: File,
  crf: number,
  metadata?: VideoMetadata,
  callbacks?: FfmpegCallbacks,
): Promise<VideoProcessResult> {
  let profile = buildCompressionProfile(crf, file, metadata)
  let lastData: Uint8Array | null = null

  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) {
      profile = tightenCompressionProfile(profile)
      callbacks?.onStatus?.(`Optimizing compression (pass ${attempt + 1})…`)
    }

    lastData = await runCompressPass(file, profile, metadata, callbacks)

    if (lastData.length <= file.size * MIN_SIZE_REDUCTION) {
      return toResult(
        file,
        lastData,
        buildOutputFilename(file, '-compressed.mp4'),
        'video/mp4',
      )
    }
  }

  if (lastData && lastData.length < file.size) {
    return toResult(
      file,
      lastData,
      buildOutputFilename(file, '-compressed.mp4'),
      'video/mp4',
    )
  }

  throw new Error(
    'This video is already heavily compressed. Move the slider right for stronger compression, or use a shorter clip.',
  )
}

export async function videoToGifFile(
  file: File,
  options: {
    fps?: number
    width?: number
    startSeconds?: number
    durationSeconds?: number
  },
  callbacks?: FfmpegCallbacks,
): Promise<VideoProcessResult> {
  const inputName = buildInputFilename(file)
  const outName = outputName('.gif')
  const fps = options.fps ?? 10
  const width = options.width ?? 480
  const start = Math.max(0, options.startSeconds ?? 0)
  const duration = Math.max(1, options.durationSeconds ?? 5)

  const data = await runFfmpegJob(
    [{ name: inputName, file }],
    outName,
    [
      '-ss',
      String(start),
      '-t',
      String(duration),
      '-i',
      inputName,
      '-vf',
      `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
      '-loop',
      '0',
      outName,
    ],
    callbacks,
    { totalDurationSeconds: duration },
  )

  return toResult(file, data, buildOutputFilename(file, '.gif'), 'image/gif')
}

async function mergeWithFilterComplex(
  files: File[],
  callbacks?: FfmpegCallbacks,
  withAudio = true,
): Promise<Uint8Array> {
  const inputs = files.map((file, index) => ({
    name: `input${index}.mp4`,
    file,
  }))
  const outName = outputName('.mp4')

  const inputArgs = inputs.flatMap((input) => ['-i', input.name])
  const filterComplex = buildMergeFilterComplex(files.length, withAudio)
  const encodeArgs = withAudio
    ? buildFastMergeVideoArgs()
    : [
        '-c:v',
        'libx264',
        '-preset',
        'veryfast',
        '-crf',
        '28',
        '-pix_fmt',
        'yuv420p',
        '-movflags',
        '+faststart',
      ]

  const args = [
    ...inputArgs,
    '-filter_complex',
    filterComplex,
    '-map',
    '[outv]',
    ...(withAudio ? ['-map', '[outa]'] : []),
    ...encodeArgs,
    outName,
  ]

  const totalDuration = files.length * 60

  return runFfmpegJob(inputs, outName, args, callbacks, {
    totalDurationSeconds: totalDuration,
  })
}

export async function mergeVideoFiles(
  files: File[],
  callbacks?: FfmpegCallbacks,
): Promise<VideoProcessResult> {
  if (files.length < 2) {
    throw new Error('Add at least two videos to merge.')
  }

  const inputs = files.map((file, index) => ({
    name: `input${index}.mp4`,
    file,
  }))
  const concatLines = inputs.map((input) => `file '${input.name}'`).join('\n')
  const outName = outputName('.mp4')

  callbacks?.onStatus?.('Trying fast merge…')

  try {
    const data = await runFfmpegJob(
      [...inputs, { name: 'concat.txt', file: concatLines }],
      outName,
      [
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        'concat.txt',
        '-c',
        'copy',
        '-movflags',
        '+faststart',
        outName,
      ],
      callbacks,
    )

    const originalSize = files.reduce((sum, file) => sum + file.size, 0)
    const blob = createVideoBlob(data, 'video/mp4')
    return {
      blob,
      filename: 'merged-video.mp4',
      originalSize,
      outputSize: blob.size,
    }
  } catch {
    callbacks?.onStatus?.('Normalizing videos to 720p for merge…')
  }

  try {
    const data = await mergeWithFilterComplex(files, callbacks, true)
    const originalSize = files.reduce((sum, file) => sum + file.size, 0)
    const blob = createVideoBlob(data, 'video/mp4')
    return {
      blob,
      filename: 'merged-video.mp4',
      originalSize,
      outputSize: blob.size,
    }
  } catch {
    callbacks?.onStatus?.('Retrying merge without audio…')
    const data = await mergeWithFilterComplex(files, callbacks, false)
    const originalSize = files.reduce((sum, file) => sum + file.size, 0)
    const blob = createVideoBlob(data, 'video/mp4')
    return {
      blob,
      filename: 'merged-video.mp4',
      originalSize,
      outputSize: blob.size,
    }
  }
}

export async function resizeVideoFile(
  file: File,
  width: number,
  height: number,
  metadata?: VideoMetadata,
  callbacks?: FfmpegCallbacks,
): Promise<VideoProcessResult> {
  const inputName = buildInputFilename(file)
  const outName = outputName('.mp4')
  const videoFilter = `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,format=yuv420p`
  const profile = buildReencodeProfile(file, metadata, {
    videoFilter,
    outputWidth: width,
    outputHeight: height,
  })

  const data = await runFfmpegJob(
    [{ name: inputName, file }],
    outName,
    buildReencodeFfmpegArgs(inputName, outName, profile),
    callbacks,
    { totalDurationSeconds: totalDurationSeconds(metadata, 120) },
  )

  return toResult(file, data, buildOutputFilename(file, '-resized.mp4'), 'video/mp4')
}

export async function rotateVideoFile(
  file: File,
  degrees: 90 | 180 | 270,
  metadata?: VideoMetadata,
  callbacks?: FfmpegCallbacks,
): Promise<VideoProcessResult> {
  const inputName = buildInputFilename(file)
  const outName = outputName('.mp4')
  const vf =
    degrees === 180
      ? 'transpose=1,transpose=1'
      : degrees === 90
        ? 'transpose=1'
        : 'transpose=2'

  const profile = buildReencodeProfile(file, metadata, { videoFilter: vf })

  const data = await runFfmpegJob(
    [{ name: inputName, file }],
    outName,
    buildReencodeFfmpegArgs(inputName, outName, profile),
    callbacks,
    { totalDurationSeconds: totalDurationSeconds(metadata, 120) },
  )

  return toResult(file, data, buildOutputFilename(file, '-rotated.mp4'), 'video/mp4')
}

export async function muteVideoFile(
  file: File,
  metadata?: VideoMetadata,
  callbacks?: FfmpegCallbacks,
): Promise<VideoProcessResult> {
  const inputName = buildInputFilename(file)
  const outName = outputName('.mp4')

  try {
    const data = await runFfmpegJob(
      [{ name: inputName, file }],
      outName,
      [
        '-i',
        inputName,
        '-c:v',
        'copy',
        '-an',
        '-movflags',
        '+faststart',
        outName,
      ],
      callbacks,
    )
    return toResult(file, data, buildOutputFilename(file, '-muted.mp4'), 'video/mp4')
  } catch {
    callbacks?.onStatus?.('Re-encoding video without audio…')
  }

  const profile = buildReencodeProfile(file, metadata, {})
  const data = await runFfmpegJob(
    [{ name: inputName, file }],
    outName,
    [
      '-i',
      inputName,
      ...buildBitrateVideoArgs(profile.targetVideoKbps, profile.preset),
      '-an',
      '-movflags',
      '+faststart',
      outName,
    ],
    callbacks,
    { totalDurationSeconds: totalDurationSeconds(metadata, 120) },
  )

  return toResult(file, data, buildOutputFilename(file, '-muted.mp4'), 'video/mp4')
}

export async function addSubtitlesToVideo(
  file: File,
  subtitleFile: File,
  metadata?: VideoMetadata,
  callbacks?: FfmpegCallbacks,
): Promise<VideoProcessResult> {
  const inputName = buildInputFilename(file)
  const outName = outputName('.mp4')
  const prepared = await prepareSubtitleForFfmpeg(subtitleFile)
  const subtitleName = prepared.vfsName
  const profile = buildReencodeProfile(file, metadata, {})

  callbacks?.onStatus?.('Embedding subtitles…')

  // Soft mux first — most reliable in ffmpeg.wasm (mov_text requires SRT)
  try {
    const data = await runFfmpegJob(
      [
        { name: inputName, file },
        { name: subtitleName, file: prepared.data },
      ],
      outName,
      [
        '-i',
        inputName,
        '-i',
        subtitleName,
        '-map',
        '0:v:0',
        '-map',
        '0:a:0?',
        '-map',
        '1:0',
        '-c:v',
        'copy',
        '-c:a',
        'copy',
        '-c:s',
        'mov_text',
        '-movflags',
        '+faststart',
        outName,
      ],
      callbacks,
      { totalDurationSeconds: totalDurationSeconds(metadata, 120) },
    )

    return toResult(file, data, buildOutputFilename(file, '-subtitled.mp4'), 'video/mp4')
  } catch {
    callbacks?.onStatus?.('Burning subtitles into video…')
  }

  try {
    const data = await runFfmpegJob(
      [
        { name: inputName, file },
        { name: subtitleName, file: prepared.data },
      ],
      outName,
      [
        '-i',
        inputName,
        '-vf',
        `subtitles=${subtitleName}`,
        ...buildBitrateVideoArgs(profile.targetVideoKbps, profile.preset),
        ...buildAudioArgs(profile),
        '-movflags',
        '+faststart',
        outName,
      ],
      callbacks,
      { totalDurationSeconds: totalDurationSeconds(metadata, 120) },
    )

    return toResult(file, data, buildOutputFilename(file, '-subtitled.mp4'), 'video/mp4')
  } catch {
    throw new Error(
      'Could not add subtitles. Check that the subtitle file is valid and matches the video length.',
    )
  }
}
