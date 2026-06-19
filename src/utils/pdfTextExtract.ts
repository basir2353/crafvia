import * as pdfjsLib from 'pdfjs-dist'
import type { TextItem } from 'pdfjs-dist/types/src/display/api.js'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { PdfLoadOptions } from './pdfProcess'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export type PdfContentBlock =
  | { kind: 'heading'; level: 1 | 2 | 3; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'table'; rows: string[][] }

export type ExtractedPdfPage = {
  pageNumber: number
  blocks: PdfContentBlock[]
}

export type ExtractedPdfDocument = {
  pageCount: number
  pages: ExtractedPdfPage[]
}

type PositionedItem = {
  str: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  hasEOL: boolean
  dir: 'ltr' | 'rtl' | 'ttb'
}

type TextLine = {
  y: number
  fontSize: number
  items: PositionedItem[]
  text: string
}

const LIST_BULLET_PATTERN = /^[\u2022\u25CF\u25CB\u25AA\u2219\u2023\u2043\-\*•]\s+/
const LIST_NUMBER_PATTERN = /^(\d+[\.\)]|\([a-zA-Z\d]+\))\s+/

async function loadPdfDocument(file: File, password?: string) {
  const data = new Uint8Array(await file.arrayBuffer())
  return pdfjsLib.getDocument({ data, password, useSystemFonts: true }).promise
}

function parseTextItem(item: TextItem): PositionedItem | null {
  if (!item.str) return null
  const transform = item.transform
  const x = transform[4] ?? 0
  const y = transform[5] ?? 0
  const fontSize = Math.max(
    Math.abs(transform[0] ?? 0),
    Math.abs(transform[3] ?? 0),
    item.height || 0,
    8,
  )
  const dir = item.dir === 'rtl' || item.dir === 'ttb' ? item.dir : 'ltr'

  return {
    str: item.str,
    x,
    y,
    width: Math.max(item.width, item.str.length * fontSize * 0.45),
    height: item.height || fontSize,
    fontSize,
    hasEOL: Boolean(item.hasEOL),
    dir,
  }
}

function isRtlItem(item: PositionedItem): boolean {
  return item.dir === 'rtl' || item.dir === 'ttb'
}

function pageIsRtl(items: PositionedItem[]): boolean {
  if (items.length === 0) return false
  const rtlCount = items.filter(isRtlItem).length
  return rtlCount / items.length >= 0.35
}

function joinLineItems(items: PositionedItem[], rtl: boolean): string {
  const ordered = rtl
    ? [...items].sort((a, b) => b.x - a.x)
    : [...items].sort((a, b) => a.x - b.x)

  let result = ''
  for (let index = 0; index < ordered.length; index += 1) {
    const item = ordered[index]!
    if (index > 0) {
      const previous = ordered[index - 1]!
      const gap = rtl
        ? previous.x - (item.x + item.width)
        : item.x - (previous.x + previous.width)
      if (gap > previous.fontSize * 0.35) {
        result += gap > previous.fontSize * 2.2 ? '\t' : ' '
      }
    }
    result += item.str
  }
  return result.trim()
}

function groupIntoLines(items: PositionedItem[]): TextLine[] {
  const rtlPage = pageIsRtl(items)
  const sorted = [...items].sort((a, b) => b.y - a.y || (rtlPage ? b.x - a.x : a.x - b.x))
  const lines: TextLine[] = []

  for (const item of sorted) {
    const tolerance = Math.max(item.height * 0.55, 3)
    let line = lines.find((candidate) => Math.abs(candidate.y - item.y) <= tolerance)

    if (!line) {
      line = { y: item.y, fontSize: item.fontSize, items: [], text: '' }
      lines.push(line)
    }

    line.items.push(item)
    line.fontSize = Math.max(line.fontSize, item.fontSize)

    if (item.hasEOL) {
      line.text = joinLineItems(line.items, rtlPage)
    }
  }

  for (const line of lines) {
    line.text = joinLineItems(line.items, rtlPage)
  }

  return lines.sort((a, b) => b.y - a.y)
}

function median(values: number[]): number {
  if (values.length === 0) return 12
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[middle - 1]! + sorted[middle]!) / 2
    : sorted[middle]!
}

function getHeadingLevel(fontSize: number, bodySize: number): 1 | 2 | 3 | null {
  if (fontSize >= bodySize * 1.75) return 1
  if (fontSize >= bodySize * 1.45) return 2
  if (fontSize >= bodySize * 1.2) return 3
  return null
}

function matchListItem(text: string): { ordered: boolean; content: string } | null {
  const bulletMatch = text.match(LIST_BULLET_PATTERN)
  if (bulletMatch) {
    return { ordered: false, content: text.replace(LIST_BULLET_PATTERN, '').trim() }
  }

  const numberMatch = text.match(LIST_NUMBER_PATTERN)
  if (numberMatch) {
    return { ordered: true, content: text.replace(LIST_NUMBER_PATTERN, '').trim() }
  }

  return null
}

function splitTableColumns(text: string): string[] | null {
  const parts = text.split('\t').map((part) => part.trim()).filter(Boolean)
  if (parts.length >= 2) return parts
  return null
}

function linesToBlocks(lines: TextLine[]): PdfContentBlock[] {
  if (lines.length === 0) return []

  const bodySize = median(lines.map((line) => line.fontSize))
  const blocks: PdfContentBlock[] = []
  let activeList: { ordered: boolean; items: string[] } | null = null
  let activeTable: string[][] | null = null

  const flushList = () => {
    if (!activeList || activeList.items.length === 0) return
    blocks.push({ kind: 'list', ordered: activeList.ordered, items: activeList.items })
    activeList = null
  }

  const flushTable = () => {
    if (!activeTable || activeTable.length === 0) return
    blocks.push({ kind: 'table', rows: activeTable })
    activeTable = null
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!
    const previous = lines[index - 1]
    const verticalGap = previous ? previous.y - line.y : 0
    const paragraphBreak = Boolean(previous && verticalGap > previous.fontSize * 1.35)
    const tableColumns = splitTableColumns(line.text)
    const listMatch = matchListItem(line.text)
    const headingLevel = paragraphBreak ? getHeadingLevel(line.fontSize, bodySize) : null

    if (tableColumns) {
      flushList()
      if (
        activeTable &&
        activeTable[0] &&
        Math.abs(activeTable[0].length - tableColumns.length) <= 1
      ) {
        activeTable.push(tableColumns)
      } else {
        flushTable()
        activeTable = [tableColumns]
      }
      continue
    }

    flushTable()

    if (headingLevel && line.text.length <= 180) {
      flushList()
      blocks.push({ kind: 'heading', level: headingLevel, text: line.text })
      continue
    }

    if (listMatch?.content) {
      if (!activeList || activeList.ordered !== listMatch.ordered) {
        flushList()
        activeList = { ordered: listMatch.ordered, items: [] }
      }
      activeList.items.push(listMatch.content)
      continue
    }

    flushList()

    const lastBlock = blocks.at(-1)
    if (
      !paragraphBreak &&
      lastBlock?.kind === 'paragraph' &&
      line.text.length > 0
    ) {
      lastBlock.text = `${lastBlock.text} ${line.text}`.trim()
    } else if (line.text.length > 0) {
      blocks.push({ kind: 'paragraph', text: line.text })
    }
  }

  flushList()
  flushTable()
  return blocks
}

async function extractPageBlocks(page: pdfjsLib.PDFPageProxy): Promise<PdfContentBlock[]> {
  const content = await page.getTextContent({
    includeMarkedContent: false,
    disableNormalization: false,
  })
  const positioned = content.items
    .filter((item): item is TextItem => 'str' in item)
    .map(parseTextItem)
    .filter((item): item is PositionedItem => item !== null)

  return linesToBlocks(groupIntoLines(positioned))
}

export async function extractStructuredPdf(
  file: File,
  options?: PdfLoadOptions,
): Promise<ExtractedPdfDocument> {
  const pdf = await loadPdfDocument(file, options?.password)
  const pages: ExtractedPdfPage[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    pages.push({
      pageNumber,
      blocks: await extractPageBlocks(page),
    })
  }

  return { pageCount: pdf.numPages, pages }
}

export function documentToPlainText(document: ExtractedPdfDocument): string {
  const parts: string[] = []

  for (const page of document.pages) {
    const pageLines: string[] = [`--- Page ${page.pageNumber} ---`]

    for (const block of page.blocks) {
      switch (block.kind) {
        case 'heading':
          pageLines.push('', block.text, '')
          break
        case 'paragraph':
          pageLines.push(block.text, '')
          break
        case 'list':
          block.items.forEach((item, index) => {
            pageLines.push(
              block.ordered ? `${index + 1}. ${item}` : `• ${item}`,
            )
          })
          pageLines.push('')
          break
        case 'table':
          block.rows.forEach((row) => pageLines.push(row.join('\t')))
          pageLines.push('')
          break
        default:
          break
      }
    }

    parts.push(pageLines.join('\n').trim())
  }

  const text = parts.filter(Boolean).join('\n\n').trim()
  return text || 'No extractable text found in this PDF.'
}

export function countExtractedCharacters(document: ExtractedPdfDocument): number {
  return documentToPlainText(document).replace(/\s+/g, ' ').trim().length
}
