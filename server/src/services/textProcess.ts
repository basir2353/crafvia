export type TextStats = {
  characters: number
  charactersNoSpaces: number
  words: number
  sentences: number
  paragraphs: number
  lines: number
}

export type CaseType =
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant'

export type SortOrder = 'asc' | 'desc'

export type ReverseMode = 'chars' | 'words' | 'lines'

export type SpaceCleanup = 'trim-lines' | 'collapse-spaces' | 'remove-all' | 'normalize'

export type DiffLine = {
  type: 'equal' | 'add' | 'remove'
  line: string
}

export type ReadingTimeResult = {
  words: number
  minutes: number
  seconds: number
  wpm: number
}

export type FancyTextStyle =
  | 'bold'
  | 'italic'
  | 'script'
  | 'fraktur'
  | 'monospace'
  | 'double'
  | 'circled'
  | 'squared'
  | 'fullwidth'

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit',
  'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat',
  'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt',
  'mollit', 'anim', 'id', 'est', 'laborum',
]

const MORSE_MAP: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', $: '...-..-', '@': '.--.-.', ' ': '/',
}

const REVERSE_MORSE = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([key, value]) => [value, key === ' ' ? ' ' : key]),
)

type FancyAlphabet = {
  upper: Map<string, string>
  lower: Map<string, string>
  digit: Map<string, string>
}

function rangeChars(start: number, letters: string): Map<string, string> {
  const map = new Map<string, string>()
  for (let i = 0; i < letters.length; i++) {
    map.set(letters[i]!, String.fromCodePoint(start + i))
  }
  return map
}

function stepChars(start: number, step: number, letters: string): Map<string, string> {
  const map = new Map<string, string>()
  for (let i = 0; i < letters.length; i++) {
    map.set(letters[i]!, String.fromCodePoint(start + i * step))
  }
  return map
}

const LATIN_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LATIN_LOWER = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '0123456789'

function buildItalicLower(): Map<string, string> {
  const map = new Map<string, string>()
  for (let i = 0; i < LATIN_LOWER.length; i++) {
    const letter = LATIN_LOWER[i]!
    if (letter === 'h') {
      map.set('h', 'ℎ')
    } else if (i < 7) {
      map.set(letter, String.fromCodePoint(0x1d44e + i))
    } else {
      map.set(letter, String.fromCodePoint(0x1d456 + (i - 8)))
    }
  }
  return map
}

function buildFrakturUpper(): Map<string, string> {
  const codes = [
    0x1d504, 0x1d505, 0x212d, 0x1d507, 0x1d508, 0x1d509, 0x1d50a, 0x210c, 0x2111, 0x1d50d,
    0x1d50e, 0x1d50f, 0x1d510, 0x1d511, 0x1d512, 0x1d513, 0x1d514, 0x211c, 0x1d516, 0x1d517,
    0x1d518, 0x1d519, 0x1d51a, 0x1d51b, 0x1d51c, 0x2128,
  ]
  const map = new Map<string, string>()
  for (let i = 0; i < LATIN_UPPER.length; i++) {
    map.set(LATIN_UPPER[i]!, String.fromCodePoint(codes[i]!))
  }
  return map
}

function buildDoubleUpper(): Map<string, string> {
  const codes = [
    0x1d538, 0x1d539, 0x2102, 0x1d53b, 0x1d53c, 0x1d53d, 0x1d53e, 0x210d, 0x1d540, 0x1d541,
    0x1d542, 0x1d543, 0x1d544, 0x2115, 0x1d546, 0x2119, 0x211a, 0x211d, 0x1d549, 0x1d54a,
    0x1d54b, 0x1d54c, 0x1d54d, 0x1d54e, 0x1d54f, 0x2124,
  ]
  const map = new Map<string, string>()
  for (let i = 0; i < LATIN_UPPER.length; i++) {
    map.set(LATIN_UPPER[i]!, String.fromCodePoint(codes[i]!))
  }
  return map
}

function buildCircledDigits(): Map<string, string> {
  const map = new Map<string, string>()
  map.set('0', '⓪')
  for (let i = 1; i <= 9; i++) {
    map.set(String(i), String.fromCodePoint(0x2460 + (i - 1)))
  }
  return map
}

function buildSquaredAlphabet(): FancyAlphabet {
  const upper = new Map<string, string>()
  const lower = new Map<string, string>()
  for (let i = 0; i < 26; i++) {
    upper.set(LATIN_UPPER[i]!, String.fromCodePoint(0x1f130 + i))
    lower.set(LATIN_LOWER[i]!, String.fromCodePoint(0x1f110 + i))
  }
  return { upper, lower, digit: new Map(DIGITS.split('').map((d) => [d, d])) }
}

function buildFancyAlphabet(style: FancyTextStyle): FancyAlphabet {
  switch (style) {
    case 'bold':
      return {
        upper: rangeChars(0x1d400, LATIN_UPPER),
        lower: rangeChars(0x1d41a, LATIN_LOWER),
        digit: rangeChars(0x1d7ce, DIGITS),
      }
    case 'italic':
      return {
        upper: rangeChars(0x1d434, LATIN_UPPER),
        lower: buildItalicLower(),
        digit: new Map(DIGITS.split('').map((d) => [d, d])),
      }
    case 'script':
      return {
        upper: stepChars(0x1d49c, 2, LATIN_UPPER),
        lower: rangeChars(0x1d4e2, LATIN_LOWER),
        digit: new Map(DIGITS.split('').map((d) => [d, d])),
      }
    case 'fraktur':
      return {
        upper: buildFrakturUpper(),
        lower: rangeChars(0x1d526, LATIN_LOWER),
        digit: new Map(DIGITS.split('').map((d) => [d, d])),
      }
    case 'monospace':
      return {
        upper: rangeChars(0x1d670, LATIN_UPPER),
        lower: rangeChars(0x1d68a, LATIN_LOWER),
        digit: rangeChars(0x1d7f6, DIGITS),
      }
    case 'double':
      return {
        upper: buildDoubleUpper(),
        lower: rangeChars(0x1d552, LATIN_LOWER),
        digit: rangeChars(0x1d7d8, DIGITS),
      }
    case 'circled':
      return {
        upper: rangeChars(0x24b6, LATIN_UPPER),
        lower: rangeChars(0x24d0, LATIN_LOWER),
        digit: buildCircledDigits(),
      }
    case 'squared':
      return buildSquaredAlphabet()
    case 'fullwidth':
      return {
        upper: rangeChars(0xff21, LATIN_UPPER),
        lower: rangeChars(0xff41, LATIN_LOWER),
        digit: rangeChars(0xff10, DIGITS),
      }
    default:
      return {
        upper: new Map(),
        lower: new Map(),
        digit: new Map(),
      }
  }
}

const FANCY_ALPHABETS: Record<FancyTextStyle, FancyAlphabet> = {
  bold: buildFancyAlphabet('bold'),
  italic: buildFancyAlphabet('italic'),
  script: buildFancyAlphabet('script'),
  fraktur: buildFancyAlphabet('fraktur'),
  monospace: buildFancyAlphabet('monospace'),
  double: buildFancyAlphabet('double'),
  circled: buildFancyAlphabet('circled'),
  squared: buildFancyAlphabet('squared'),
  fullwidth: buildFancyAlphabet('fullwidth'),
}

function countSentences(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  const matches = trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g)
  return matches?.length ?? 1
}

export function countTextStats(text: string): TextStats {
  const trimmed = text.trim()
  return {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    words: trimmed ? trimmed.split(/\s+/).length : 0,
    sentences: countSentences(text),
    paragraphs: trimmed ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0,
    lines: text.length ? text.split('\n').length : 0,
  }
}

function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
}

function toSentenceCase(text: string): string {
  const lower = text.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

function wordsToCase(text: string, joiner: (words: string[]) => string): string {
  const words = text.match(/[A-Za-z0-9]+/g) ?? []
  if (words.length === 0) return text
  return joiner(words)
}

export function convertCase(text: string, caseType: CaseType): string {
  switch (caseType) {
    case 'upper':
      return text.toUpperCase()
    case 'lower':
      return text.toLowerCase()
    case 'title':
      return toTitleCase(text)
    case 'sentence':
      return toSentenceCase(text)
    case 'camel':
      return wordsToCase(text, (words) =>
        words
          .map((word, i) =>
            i === 0
              ? word.toLowerCase()
              : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(''),
      )
    case 'pascal':
      return wordsToCase(text, (words) =>
        words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(''),
      )
    case 'snake':
      return wordsToCase(text, (words) => words.map((w) => w.toLowerCase()).join('_'))
    case 'kebab':
      return wordsToCase(text, (words) => words.map((w) => w.toLowerCase()).join('-'))
    case 'constant':
      return wordsToCase(text, (words) => words.map((w) => w.toUpperCase()).join('_'))
    default:
      return text
  }
}

function randomLoremWord(index: number): string {
  return LOREM_WORDS[index % LOREM_WORDS.length] ?? 'lorem'
}

export function generateLoremIpsum(paragraphs: number, wordsPerParagraph = 50): string {
  const count = Math.min(Math.max(1, paragraphs), 20)
  const words = Math.min(Math.max(10, wordsPerParagraph), 200)
  const result: string[] = []
  let wordIndex = 0

  for (let p = 0; p < count; p++) {
    const sentenceWords: string[] = []
    for (let w = 0; w < words; w++) {
      sentenceWords.push(randomLoremWord(wordIndex++))
    }
    let paragraph = sentenceWords.join(' ')
    paragraph = paragraph.charAt(0).toUpperCase() + paragraph.slice(1) + '.'
    result.push(paragraph)
  }

  return result.join('\n\n')
}

export type DuplicateMode = 'lines' | 'words' | 'consecutive'

export function removeDuplicateLines(text: string, caseSensitive = true): string {
  const lines = text.split('\n')
  const seen = new Set<string>()
  const output: string[] = []

  for (const line of lines) {
    const key = caseSensitive ? line : line.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      output.push(line)
    }
  }

  return output.join('\n')
}

export function removeDuplicateWords(text: string, caseSensitive = true): string {
  return text
    .split('\n')
    .map((line) => {
      const seen = new Set<string>()
      const words = line.split(/\s+/).filter(Boolean)
      const output: string[] = []

      for (const word of words) {
        const key = caseSensitive ? word : word.toLowerCase()
        if (!seen.has(key)) {
          seen.add(key)
          output.push(word)
        }
      }

      return output.join(' ')
    })
    .join('\n')
}

function removeConsecutiveRepeatsInLine(line: string): string {
  const trimmed = line
  if (trimmed.length < 2) return line

  for (let len = Math.floor(trimmed.length / 2); len >= 1; len--) {
    const pattern = trimmed.slice(0, len)
    if (trimmed.length % len !== 0) continue

    const repeats = trimmed.length / len
    if (repeats >= 2 && pattern.repeat(repeats) === trimmed) {
      return pattern
    }
  }

  return line
}

export function removeConsecutiveRepeats(text: string): string {
  return text.split('\n').map(removeConsecutiveRepeatsInLine).join('\n')
}

export function removeDuplicates(
  text: string,
  mode: DuplicateMode = 'lines',
  caseSensitive = true,
): string {
  switch (mode) {
    case 'words':
      return removeDuplicateWords(text, caseSensitive)
    case 'consecutive':
      return removeConsecutiveRepeats(text)
    case 'lines':
    default:
      return removeDuplicateLines(text, caseSensitive)
  }
}

export function sortLines(text: string, order: SortOrder, caseSensitive = false): string {
  const lines = text.split('\n')
  const sorted = [...lines].sort((a, b) => {
    const left = caseSensitive ? a : a.toLowerCase()
    const right = caseSensitive ? b : b.toLowerCase()
    return left.localeCompare(right)
  })
  return (order === 'desc' ? sorted.reverse() : sorted).join('\n')
}

export function reverseText(text: string, mode: ReverseMode): string {
  switch (mode) {
    case 'chars':
      return [...text].reverse().join('')
    case 'words':
      return text.split(/(\s+)/).reverse().join('')
    case 'lines':
      return text.split('\n').reverse().join('\n')
    default:
      return text
  }
}

export function findAndReplace(
  text: string,
  find: string,
  replace: string,
  useRegex = false,
  caseSensitive = true,
): string {
  if (!find) return text

  if (useRegex) {
    try {
      const flags = caseSensitive ? 'g' : 'gi'
      return text.replace(new RegExp(find, flags), replace)
    } catch {
      throw new Error('Invalid regular expression pattern.')
    }
  }

  if (caseSensitive) {
    return text.split(find).join(replace)
  }

  const pattern = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(pattern, 'gi'), replace)
}

export function addLineNumbers(text: string, startAt = 1, separator = '. '): string {
  const lines = text.split('\n')
  const start = Math.max(1, startAt)
  return lines
    .map((line, index) => `${start + index}${separator}${line}`)
    .join('\n')
}

export function removeExtraSpaces(text: string, mode: SpaceCleanup): string {
  switch (mode) {
    case 'trim-lines':
      return text
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
    case 'collapse-spaces':
      return text
        .split('\n')
        .map((line) => line.replace(/[ \t]+/g, ' ').trim())
        .join('\n')
    case 'remove-all':
      return text.replace(/\s+/g, '')
    case 'normalize':
      return text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim()
    default:
      return text
  }
}

export function diffText(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  const m = oldLines.length
  const n = newLines.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i]![j] =
        oldLines[i] === newLines[j]
          ? dp[i + 1]![j + 1]! + 1
          : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!)
    }
  }

  const result: DiffLine[] = []
  let i = 0
  let j = 0

  while (i < m && j < n) {
    if (oldLines[i] === newLines[j]) {
      result.push({ type: 'equal', line: oldLines[i] ?? '' })
      i++
      j++
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      result.push({ type: 'remove', line: oldLines[i] ?? '' })
      i++
    } else {
      result.push({ type: 'add', line: newLines[j] ?? '' })
      j++
    }
  }

  while (i < m) {
    result.push({ type: 'remove', line: oldLines[i] ?? '' })
    i++
  }

  while (j < n) {
    result.push({ type: 'add', line: newLines[j] ?? '' })
    j++
  }

  return result
}

export function formatDiffText(diff: DiffLine[]): string {
  return diff
    .map((entry) => {
      const prefix = entry.type === 'add' ? '+ ' : entry.type === 'remove' ? '- ' : '  '
      return `${prefix}${entry.line}`
    })
    .join('\n')
}

function applyFancyMap(char: string, style: FancyTextStyle): string {
  const alphabet = FANCY_ALPHABETS[style]
  if (!alphabet) return char

  const upper = alphabet.upper.get(char)
  if (upper) return upper

  const lower = alphabet.lower.get(char)
  if (lower) return lower

  const digit = alphabet.digit.get(char)
  if (digit) return digit

  return char
}

export function toFancyText(text: string, style: FancyTextStyle): string {
  return [...text].map((char) => applyFancyMap(char, style)).join('')
}

export function textToMorse(text: string): string {
  return [...text.toUpperCase()]
    .map((char) => MORSE_MAP[char] ?? '')
    .filter(Boolean)
    .join(' ')
}

export function morseToText(morse: string): string {
  return morse
    .trim()
    .split(/\s+/)
    .map((token) => {
      if (token === '/') return ' '
      return REVERSE_MORSE[token] ?? ''
    })
    .join('')
}

export function textToBinary(text: string, separator = ' '): string {
  return [...text]
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(separator)
}

export function binaryToText(binary: string): string {
  const cleaned = binary.replace(/[^01]/g, '')
  if (cleaned.length % 8 !== 0) {
    throw new Error('Binary input length must be a multiple of 8 bits.')
  }

  const chars: string[] = []
  for (let i = 0; i < cleaned.length; i += 8) {
    const byte = cleaned.slice(i, i + 8)
    chars.push(String.fromCharCode(parseInt(byte, 2)))
  }
  return chars.join('')
}

export function estimateReadingTime(text: string, wpm = 200): ReadingTimeResult {
  const words = countTextStats(text).words
  const totalSeconds = Math.ceil((words / wpm) * 60)
  return {
    words,
    wpm,
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
  }
}

export type EmojiCategory = {
  name: string
  emojis: string[]
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '🙂', '😉', '😍', '🥰', '😘', '😎', '🤔', '😴'],
  },
  {
    name: 'Gestures',
    emojis: ['👍', '👎', '👏', '🙌', '🤝', '✌️', '🤞', '👌', '💪', '🙏', '👋', '🤙', '☝️', '✋', '🖐️', '👊'],
  },
  {
    name: 'Hearts',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖'],
  },
  {
    name: 'Nature',
    emojis: ['🌸', '🌺', '🌻', '🌹', '🌷', '🌿', '🍀', '🌳', '🌴', '🌵', '🌈', '☀️', '🌙', '⭐', '🔥', '💧'],
  },
  {
    name: 'Food',
    emojis: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥭', '🍍', '🥥', '🍕', '🍔', '🍟', '🍩'],
  },
  {
    name: 'Objects',
    emojis: ['💡', '📱', '💻', '⌨️', '🖥️', '📷', '🎵', '🎬', '📚', '✏️', '📝', '📌', '🔑', '🎁', '🎈', '🏆'],
  },
  {
    name: 'Symbols',
    emojis: ['✅', '❌', '⚠️', '❗', '❓', '💯', '🔔', '🔒', '🔓', '⚡', '✨', '💫', '♻️', '🔁', '➡️', '⬅️'],
  },
]

export type TextToolSlug =
  | 'word-counter'
  | 'case-converter'
  | 'lorem-ipsum'
  | 'remove-duplicates'
  | 'sort-lines'
  | 'reverse-text'
  | 'find-replace'
  | 'add-line-numbers'
  | 'remove-spaces'
  | 'text-diff'
  | 'fancy-text'
  | 'morse-code'
  | 'binary-converter'
  | 'reading-time'

export type TextToolRequest = {
  text?: string
  textA?: string
  textB?: string
  options?: Record<string, string | number | boolean>
}

export type TextToolResponse = {
  output?: string
  stats?: TextStats
  readingTime?: ReadingTimeResult
  diff?: DiffLine[]
  error?: string
}

export function processTextTool(slug: TextToolSlug, request: TextToolRequest): TextToolResponse {
  const text = request.text ?? ''
  const options = request.options ?? {}

  switch (slug) {
    case 'word-counter':
      return { stats: countTextStats(text) }
    case 'case-converter':
      return {
        output: convertCase(text, (options.caseType as CaseType) ?? 'upper'),
      }
    case 'lorem-ipsum':
      return {
        output: generateLoremIpsum(
          Number(options.paragraphs ?? 3),
          Number(options.wordsPerParagraph ?? 50),
        ),
      }
    case 'remove-duplicates':
      return {
        output: removeDuplicates(
          text,
          (options.mode as DuplicateMode) ?? 'lines',
          Boolean(options.caseSensitive ?? false),
        ),
      }
    case 'sort-lines':
      return {
        output: sortLines(
          text,
          (options.order as SortOrder) ?? 'asc',
          Boolean(options.caseSensitive ?? false),
        ),
      }
    case 'reverse-text':
      return {
        output: reverseText(text, (options.mode as ReverseMode) ?? 'chars'),
      }
    case 'find-replace':
      try {
        return {
          output: findAndReplace(
            text,
            String(options.find ?? ''),
            String(options.replace ?? ''),
            Boolean(options.useRegex ?? false),
            Boolean(options.caseSensitive ?? true),
          ),
        }
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Replace failed.' }
      }
    case 'add-line-numbers':
      return {
        output: addLineNumbers(
          text,
          Number(options.startAt ?? 1),
          String(options.separator ?? '. '),
        ),
      }
    case 'remove-spaces':
      return {
        output: removeExtraSpaces(text, (options.mode as SpaceCleanup) ?? 'collapse-spaces'),
      }
    case 'text-diff': {
      const diff = diffText(request.textA ?? '', request.textB ?? '')
      return { diff, output: formatDiffText(diff) }
    }
    case 'fancy-text':
      return {
        output: toFancyText(text, (options.style as FancyTextStyle) ?? 'bold'),
      }
    case 'morse-code':
      return {
        output:
          (options.direction as string) === 'decode'
            ? morseToText(text)
            : textToMorse(text),
      }
    case 'binary-converter':
      try {
        return {
          output:
            (options.direction as string) === 'decode'
              ? binaryToText(text)
              : textToBinary(text, String(options.separator ?? ' ')),
        }
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Binary conversion failed.' }
      }
    case 'reading-time':
      return {
        readingTime: estimateReadingTime(text, Number(options.wpm ?? 200)),
        stats: countTextStats(text),
      }
    default:
      return { error: 'Unknown text tool.' }
  }
}
