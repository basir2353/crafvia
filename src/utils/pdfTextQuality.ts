import type { ExtractedPdfDocument } from './pdfTextExtract'
import { documentToPlainText } from './pdfTextExtract'

const GARBLED_SYMBOL_PATTERN = /[∫±µ∑∏√∞§¶†‡∆ΩαβγþðøĞĐ]/g
const READABLE_CHAR_PATTERN = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9]/g

export function scoreExtractedTextQuality(text: string): number {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized || normalized === 'No extractable text found in this PDF.') {
    return 0
  }

  const length = normalized.length
  let score = 1

  const garbledSymbols = normalized.match(GARBLED_SYMBOL_PATTERN)
  if (garbledSymbols && garbledSymbols.length / length > 0.015) {
    score -= 0.55
  }

  const readable = normalized.match(READABLE_CHAR_PATTERN)
  const readableRatio = readable ? readable.length / length : 0
  if (readableRatio < 0.45) {
    score -= 0.35
  } else if (readableRatio > 0.7) {
    score += 0.1
  }

  const words = normalized.split(/\s+/).filter(Boolean)
  const suspiciousWords = words.filter(
    (word) =>
      GARBLED_SYMBOL_PATTERN.test(word) ||
      (word.length >= 4 && readableRatio < 0.5 && !/[\u0600-\u06FFa-zA-Z]{3,}/.test(word)),
  )
  if (words.length > 0 && suspiciousWords.length / words.length > 0.18) {
    score -= 0.35
  }

  return Math.max(0, Math.min(1, score))
}

export function isExtractedTextUnreliable(document: ExtractedPdfDocument): boolean {
  const text = documentToPlainText(document)
  const totalBlocks = document.pages.reduce((sum, page) => sum + page.blocks.length, 0)

  if (totalBlocks === 0) return true
  return scoreExtractedTextQuality(text) < 0.6
}

export function containsRtlScript(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)
}
