import type { VideoMetadata } from './videoInfo'

/** x264 preset — fast gives much better compression efficiency than ultrafast at similar speed in wasm. */
export type X264Preset = 'ultrafast' | 'veryfast' | 'fast' | 'medium'

export type CompressionProfile = {
  /** Target video bitrate in kbps — primary size control for compression. */
  targetVideoKbps: number
  audioKbps: number
  preset: X264Preset
  tryAudioCopy: boolean
  scaleFilter: string | null
  /** 0 = low compression / high quality, 1 = high compression. */
  strength: number
}

export type ReencodeProfile = {
  targetVideoKbps: number
  audioKbps: number
  preset: X264Preset
  tryAudioCopy: boolean
  videoFilter?: string
}

/** Estimate total media bitrate from file size and duration. */
export function estimateTotalBitrateKbps(fileSizeBytes: number, durationSeconds: number): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0
  return (fileSizeBytes * 8) / durationSeconds / 1000
}

/** Rough video bitrate after reserving headroom for audio/container. */
export function estimateVideoBitrateKbps(
  fileSizeBytes: number,
  durationSeconds: number,
  audioReserveKbps = 96,
): number {
  const total = estimateTotalBitrateKbps(fileSizeBytes, durationSeconds)
  if (total <= 0) return 800
  return Math.max(80, total - audioReserveKbps)
}

/** Suggested max video bitrate for a resolution (kbps). */
export function bitrateCapForResolution(width: number, height: number): number {
  const pixels = width * height
  if (pixels <= 640 * 360) return 700
  if (pixels <= 854 * 480) return 1100
  if (pixels <= 1280 * 720) return 2200
  if (pixels <= 1920 * 1080) return 4500
  if (pixels <= 2560 * 1440) return 8000
  return 12000
}

/**
 * Map the existing CRF slider (18–35, lower = better quality) to a compression profile.
 * 18–22 ≈ Low, 23–28 ≈ Medium, 29–35 ≈ High compression.
 */
export function buildCompressionProfile(
  crfSlider: number,
  file: File,
  metadata?: VideoMetadata,
): CompressionProfile {
  const crf = Math.min(35, Math.max(18, Math.round(crfSlider)))
  const strength = (crf - 18) / 17

  const duration =
    metadata?.duration && Number.isFinite(metadata.duration) && metadata.duration > 0
      ? metadata.duration
      : Math.max(10, file.size / (200 * 1024))

  const sourceVideoKbps = estimateVideoBitrateKbps(file.size, duration)
  const resolutionCap =
    metadata?.width && metadata?.height
      ? bitrateCapForResolution(metadata.width, metadata.height)
      : sourceVideoKbps

  // Higher strength → smaller target (0.88 → 0.38 of source video bitrate)
  const sizeFactor = 0.88 - strength * 0.5
  let targetVideoKbps = Math.floor(Math.min(sourceVideoKbps, resolutionCap) * sizeFactor)

  // Never aim above 95% of source — compression must reduce video bitrate
  const hardCap = Math.floor(sourceVideoKbps * 0.95)
  targetVideoKbps = Math.min(targetVideoKbps, hardCap)
  targetVideoKbps = Math.max(80, targetVideoKbps)

  const audioKbps = strength < 0.35 ? 128 : strength < 0.65 ? 96 : 64
  const tryAudioCopy = strength < 0.45

  let scaleFilter: string | null = null
  const width = metadata?.width ?? 0
  if (width > 1920 && strength > 0.35) {
    scaleFilter = 'scale=1920:-2:force_original_aspect_ratio=decrease'
  } else if (width > 1280 && strength > 0.55) {
    scaleFilter = 'scale=1280:-2:force_original_aspect_ratio=decrease'
  } else if (width > 960 && strength > 0.78) {
    scaleFilter = 'scale=960:-2:force_original_aspect_ratio=decrease'
  }

  return {
    targetVideoKbps,
    audioKbps,
    preset: 'fast',
    tryAudioCopy,
    scaleFilter,
    strength,
  }
}

/** Tighten profile when a pass still produces a larger file. */
export function tightenCompressionProfile(profile: CompressionProfile): CompressionProfile {
  const next: CompressionProfile = {
    ...profile,
    targetVideoKbps: Math.max(80, Math.floor(profile.targetVideoKbps * 0.72)),
    tryAudioCopy: false,
    audioKbps: Math.min(profile.audioKbps, 64),
  }
  if (!next.scaleFilter) {
    next.scaleFilter = 'scale=960:-2:force_original_aspect_ratio=decrease'
  } else if (next.scaleFilter.includes('1920')) {
    next.scaleFilter = 'scale=1280:-2:force_original_aspect_ratio=decrease'
  } else if (next.scaleFilter.includes('1280')) {
    next.scaleFilter = 'scale=960:-2:force_original_aspect_ratio=decrease'
  }
  return next
}

export function buildBitrateVideoArgs(
  targetVideoKbps: number,
  preset: X264Preset,
): string[] {
  const kbps = Math.max(80, Math.round(targetVideoKbps))
  return [
    '-c:v',
    'libx264',
    '-preset',
    preset,
    '-b:v',
    `${kbps}k`,
    '-maxrate',
    `${Math.round(kbps * 1.2)}k`,
    '-bufsize',
    `${Math.round(kbps * 2)}k`,
    '-pix_fmt',
    'yuv420p',
  ]
}

export function buildAudioArgs(profile: { audioKbps: number; tryAudioCopy: boolean }): string[] {
  if (profile.tryAudioCopy) {
    return ['-c:a', 'copy']
  }
  return ['-c:a', 'aac', '-b:a', `${profile.audioKbps}k`, '-ac', '2']
}

export function buildCompressFfmpegArgs(
  inputName: string,
  outName: string,
  profile: CompressionProfile,
): string[] {
  const args = ['-i', inputName]
  if (profile.scaleFilter) {
    args.push('-vf', profile.scaleFilter)
  }
  args.push(
    ...buildBitrateVideoArgs(profile.targetVideoKbps, profile.preset),
    ...buildAudioArgs(profile),
    '-movflags',
    '+faststart',
    outName,
  )
  return args
}

export function buildReencodeFfmpegArgs(
  inputName: string,
  outName: string,
  profile: ReencodeProfile,
): string[] {
  const args = ['-i', inputName]
  if (profile.videoFilter) {
    args.push('-vf', profile.videoFilter)
  }
  args.push(
    ...buildBitrateVideoArgs(profile.targetVideoKbps, profile.preset),
    ...buildAudioArgs(profile),
    '-movflags',
    '+faststart',
    outName,
  )
  return args
}

/** Bitrate-bounded re-encode profile for resize/rotate/trim fallback. */
export function buildReencodeProfile(
  file: File,
  metadata: VideoMetadata | undefined,
  options: { videoFilter?: string; outputWidth?: number; outputHeight?: number },
): ReencodeProfile {
  const duration =
    metadata?.duration && Number.isFinite(metadata.duration) && metadata.duration > 0
      ? metadata.duration
      : Math.max(10, file.size / (200 * 1024))

  const sourceVideoKbps = estimateVideoBitrateKbps(file.size, duration)
  const outW = options.outputWidth ?? metadata?.width ?? 1280
  const outH = options.outputHeight ?? metadata?.height ?? 720
  const resolutionCap = bitrateCapForResolution(outW, outH)

  const targetVideoKbps = Math.max(
    80,
    Math.min(sourceVideoKbps, resolutionCap, Math.floor(resolutionCap * 0.85)),
  )

  return {
    targetVideoKbps,
    audioKbps: 96,
    preset: 'fast',
    tryAudioCopy: true,
    videoFilter: options.videoFilter,
  }
}

export function buildStreamCopyArgs(inputName: string, outName: string): string[] {
  return [
    '-i',
    inputName,
    '-c:v',
    'copy',
    '-c:a',
    'copy',
    '-movflags',
    '+faststart',
    outName,
  ]
}

export function buildTrimCopyArgs(
  inputName: string,
  outName: string,
  startSeconds: number,
  endSeconds: number,
): string[] {
  return [
    '-ss',
    String(startSeconds),
    '-to',
    String(endSeconds),
    '-i',
    inputName,
    '-c',
    'copy',
    '-avoid_negative_ts',
    'make_zero',
    '-movflags',
    '+faststart',
    outName,
  ]
}

/** Merge / batch jobs — prioritize speed over size. */
export function buildFastMergeVideoArgs(): string[] {
  return [
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '28',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    '96k',
    '-movflags',
    '+faststart',
  ]
}
