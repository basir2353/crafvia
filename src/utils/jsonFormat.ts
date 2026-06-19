export const MAX_JSON_LENGTH = 2_000_000

export type JsonParseError = {
  message: string
  line: number
  column: number
  position: number
}

export type JsonStats = {
  keys: number
  objects: number
  arrays: number
  characters: number
  sizeBytes: number
}

export type JsonFormatResult = {
  formatted: string
  stats: JsonStats
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function positionToLineColumn(text: string, position: number): {
  line: number
  column: number
} {
  const safePosition = Math.max(0, Math.min(position, text.length))
  const before = text.slice(0, safePosition)
  const lines = before.split('\n')
  return {
    line: lines.length,
    column: (lines[lines.length - 1]?.length ?? 0) + 1,
  }
}

function extractErrorPosition(message: string, text: string): number {
  const positionMatch = message.match(/position (\d+)/i)
  if (positionMatch) {
    return Number(positionMatch[1])
  }

  const lineMatch = message.match(/line (\d+) column (\d+)/i)
  if (lineMatch) {
    const targetLine = Number(lineMatch[1])
    const targetColumn = Number(lineMatch[2])
    const lines = text.split('\n')
    let position = 0
    for (let index = 0; index < targetLine - 1; index += 1) {
      position += (lines[index]?.length ?? 0) + 1
    }
    position += Math.max(0, targetColumn - 1)
    return position
  }

  return 0
}

export function parseJsonWithError(text: string): {
  value?: unknown
  error?: JsonParseError
} {
  const trimmed = text.trim()

  if (!trimmed) {
    return {
      error: {
        message: 'Please enter JSON data.',
        line: 1,
        column: 1,
        position: 0,
      },
    }
  }

  if (trimmed.length > MAX_JSON_LENGTH) {
    return {
      error: {
        message: `JSON exceeds ${MAX_JSON_LENGTH.toLocaleString()} character limit.`,
        line: 1,
        column: 1,
        position: 0,
      },
    }
  }

  try {
    return { value: JSON.parse(trimmed) }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON'
    const position = extractErrorPosition(message, trimmed)
    const { line, column } = positionToLineColumn(trimmed, position)
    return {
      error: {
        message,
        line,
        column,
        position,
      },
    }
  }
}

export function formatJson(value: unknown, indent = 2): string {
  return `${JSON.stringify(value, null, indent)}\n`
}

export function minifyJson(value: unknown): string {
  return `${JSON.stringify(value)}\n`
}

export function countJsonStats(value: unknown, output: string): JsonStats {
  let keys = 0
  let objects = 0
  let arrays = 0

  const walk = (current: unknown): void => {
    if (Array.isArray(current)) {
      arrays += 1
      current.forEach(walk)
      return
    }

    if (current && typeof current === 'object') {
      objects += 1
      for (const [key, nested] of Object.entries(current)) {
        keys += 1
        void key
        walk(nested)
      }
    }
  }

  walk(value)

  return {
    keys,
    objects,
    arrays,
    characters: output.length,
    sizeBytes: new Blob([output]).size,
  }
}

export function formatJsonText(text: string, indent = 2): JsonFormatResult | JsonParseError {
  const parsed = parseJsonWithError(text)
  if (parsed.error || parsed.value === undefined) {
    return parsed.error!
  }

  const formatted = formatJson(parsed.value, indent)
  return {
    formatted,
    stats: countJsonStats(parsed.value, formatted),
  }
}

export function minifyJsonText(text: string): JsonFormatResult | JsonParseError {
  const parsed = parseJsonWithError(text)
  if (parsed.error || parsed.value === undefined) {
    return parsed.error!
  }

  const formatted = minifyJson(parsed.value)
  return {
    formatted,
    stats: countJsonStats(parsed.value, formatted),
  }
}

export function highlightJson(json: string): string {
  const escaped = escapeHtml(json)
  const tokenPattern =
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g

  return escaped.replace(tokenPattern, (match, quoted?: string, colon?: string) => {
    if (quoted) {
      if (colon) {
        return `<span class="json-key">${quoted}</span>${colon}`
      }
      return `<span class="json-string">${quoted}</span>`
    }

    if (match === 'true' || match === 'false' || match === 'null') {
      return `<span class="json-keyword">${match}</span>`
    }

    return `<span class="json-number">${match}</span>`
  })
}

export function getLineNumbers(text: string): string[] {
  const lineCount = Math.max(1, text.split('\n').length)
  return Array.from({ length: lineCount }, (_, index) => String(index + 1))
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
