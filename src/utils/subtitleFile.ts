export type SubtitleFormat = 'srt' | 'vtt'

export type SubtitleValidation =
  | { ok: true; format: SubtitleFormat }
  | { ok: false; reason: string }

const SUBTITLE_MIME_TYPES = new Set([
  'application/x-subrip',
  'text/vtt',
  'text/plain',
  'application/octet-stream',
])

function hasExtension(name: string, ext: string): boolean {
  return name.toLowerCase().endsWith(ext)
}

function detectFormatFromContent(text: string): SubtitleFormat | null {
  const trimmed = text.trimStart()
  if (trimmed.startsWith('WEBVTT')) return 'vtt'
  if (/^\d+\s*\r?\n\d{2}:\d{2}:\d{2}[,\.]\d{2,3}\s*-->/.test(trimmed)) return 'srt'
  return null
}

export async function validateSubtitleFile(file: File): Promise<SubtitleValidation> {
  if (file.size === 0) {
    return { ok: false, reason: 'Subtitle file is empty.' }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, reason: 'Subtitle file exceeds 5MB limit.' }
  }

  const name = file.name.toLowerCase()
  if (hasExtension(name, '.srt')) return { ok: true, format: 'srt' }
  if (hasExtension(name, '.vtt')) return { ok: true, format: 'vtt' }

  if (file.type && !SUBTITLE_MIME_TYPES.has(file.type)) {
    return {
      ok: false,
      reason: 'Upload an .srt or .vtt subtitle file.',
    }
  }

  try {
    const sample = await file.slice(0, 8192).text()
    const detected = detectFormatFromContent(sample)
    if (detected) return { ok: true, format: detected }
  } catch {
    return { ok: false, reason: 'Could not read subtitle file.' }
  }

  return {
    ok: false,
    reason: 'Upload an .srt or .vtt subtitle file.',
  }
}

function vttTimeToSrt(time: string): string {
  const normalized = time.trim().replace('.', ',')
  if (/^\d{2}:\d{2}:\d{2},\d{3}$/.test(normalized)) return normalized
  if (/^\d{2}:\d{2},\d{3}$/.test(normalized)) return `00:${normalized}`
  return normalized
}

/** Minimal WEBVTT → SRT conversion for FFmpeg mov_text / burn-in. */
export function vttToSrt(vtt: string): string {
  const lines = vtt.replace(/^\uFEFF/, '').split(/\r?\n/)
  const blocks: string[] = []
  let index = 1
  let i = 0

  while (i < lines.length && !lines[i]?.trim()) i++
  if (lines[i]?.trim().startsWith('WEBVTT')) i++

  while (i < lines.length) {
    while (i < lines.length && !lines[i]?.trim()) i++
    if (i >= lines.length) break

    if (lines[i]?.includes('-->')) {
      const [startRaw, endRaw] = lines[i].split('-->').map((part) => part.trim())
      i++
      const textLines: string[] = []
      while (i < lines.length && lines[i]?.trim()) {
        textLines.push(lines[i].replace(/<\/?[^>]+>/g, '').trim())
        i++
      }
      if (textLines.length > 0) {
        blocks.push(
          String(index),
          `${vttTimeToSrt(startRaw ?? '')} --> ${vttTimeToSrt(endRaw ?? '')}`,
          textLines.join('\n'),
          '',
        )
        index++
      }
      continue
    }

    i++
  }

  return blocks.join('\n').trim() + '\n'
}

export type PreparedSubtitle = {
  data: Uint8Array
  vfsName: 'subtitles.srt'
  format: SubtitleFormat
}

export async function prepareSubtitleForFfmpeg(file: File): Promise<PreparedSubtitle> {
  const validation = await validateSubtitleFile(file)
  if (!validation.ok) {
    throw new Error(validation.reason)
  }

  const text = await file.text()
  const format =
    validation.format === 'vtt' || detectFormatFromContent(text) === 'vtt' ? 'vtt' : 'srt'
  const srtContent = format === 'vtt' ? vttToSrt(text) : text
  const encoder = new TextEncoder()

  return {
    data: encoder.encode(srtContent),
    vfsName: 'subtitles.srt',
    format,
  }
}
