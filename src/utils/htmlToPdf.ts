import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'

export type HtmlToPdfResult = {
  blob: Blob
  filename: string
  originalSize: number
  outputSize: number
  pageCount: number
}

const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842
const PAGE_PADDING = 48
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_PADDING * 2
const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_PADDING * 2

const DOCUMENT_STYLES = `
  .doc-page-content {
    width: ${CONTENT_WIDTH}px;
    color: #111827;
    font-family: Calibri, "Segoe UI", Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.45;
    word-wrap: break-word;
  }
  .doc-page-content h1 { font-size: 20pt; font-weight: 700; margin: 0 0 12px; }
  .doc-page-content h2 { font-size: 16pt; font-weight: 700; margin: 16px 0 10px; }
  .doc-page-content h3 { font-size: 13pt; font-weight: 700; margin: 14px 0 8px; }
  .doc-page-content p { margin: 0 0 10px; }
  .doc-page-content ul, .doc-page-content ol { margin: 0 0 12px 20px; padding: 0; }
  .doc-page-content li { margin: 0 0 6px; }
  .doc-page-content table { width: 100%; border-collapse: collapse; margin: 0 0 14px; }
  .doc-page-content th, .doc-page-content td {
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    vertical-align: top;
  }
  .doc-page-content th { background: #f8fafc; font-weight: 700; }
  .doc-page-content strong, .doc-page-content b { font-weight: 700; }
  .doc-page-content em, .doc-page-content i { font-style: italic; }
`

function createMeasureHost(): HTMLDivElement {
  const host = document.createElement('div')
  host.style.position = 'fixed'
  host.style.left = '-12000px'
  host.style.top = '0'
  host.style.width = `${PAGE_WIDTH}px`
  host.style.visibility = 'hidden'
  host.style.pointerEvents = 'none'
  document.body.appendChild(host)
  return host
}

function createPageShell(): HTMLDivElement {
  const page = document.createElement('div')
  page.className = 'doc-page-content'
  page.style.width = `${CONTENT_WIDTH}px`
  page.style.minHeight = `${CONTENT_HEIGHT}px`
  page.style.boxSizing = 'border-box'
  return page
}

function collectBlockNodes(source: HTMLElement): HTMLElement[] {
  const blocks: HTMLElement[] = []
  source.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      if (text) {
        const paragraph = document.createElement('p')
        paragraph.textContent = text
        blocks.push(paragraph)
      }
      return
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      blocks.push(node.cloneNode(true) as HTMLElement)
    }
  })
  return blocks
}

function paginateHtmlBlocks(blocks: HTMLElement[], host: HTMLDivElement): HTMLDivElement[] {
  const pages: HTMLDivElement[] = []
  let currentPage = createPageShell()
  host.innerHTML = `<style>${DOCUMENT_STYLES}</style>`
  host.appendChild(currentPage)

  const measureHeight = () => currentPage.getBoundingClientRect().height

  for (const block of blocks) {
    currentPage.appendChild(block)
    if (measureHeight() > CONTENT_HEIGHT && currentPage.childElementCount > 1) {
      currentPage.removeChild(block)
      pages.push(currentPage)
      currentPage = createPageShell()
      host.innerHTML = `<style>${DOCUMENT_STYLES}</style>`
      host.appendChild(currentPage)
      currentPage.appendChild(block)
    }
  }

  if (currentPage.childElementCount > 0) {
    pages.push(currentPage)
  }

  return pages.length > 0 ? pages : [createPageShell()]
}

async function renderPageToPdfImage(page: HTMLDivElement): Promise<Uint8Array> {
  const mount = document.createElement('div')
  mount.style.position = 'fixed'
  mount.style.left = '-12000px'
  mount.style.top = '0'
  mount.style.width = `${PAGE_WIDTH}px`
  mount.style.height = `${PAGE_HEIGHT}px`
  mount.style.padding = `${PAGE_PADDING}px`
  mount.style.background = '#ffffff'
  mount.style.boxSizing = 'border-box'
  mount.innerHTML = `<style>${DOCUMENT_STYLES}</style>`
  mount.appendChild(page.cloneNode(true))
  document.body.appendChild(mount)

  try {
    const canvas = await html2canvas(mount, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })
    const pngBuffer = await fetch(canvas.toDataURL('image/png')).then((response) =>
      response.arrayBuffer(),
    )
    return new Uint8Array(pngBuffer)
  } finally {
    document.body.removeChild(mount)
  }
}

export async function htmlStringToPdf(
  html: string,
  filename = 'document.pdf',
): Promise<HtmlToPdfResult> {
  const trimmed = html.trim()
  if (!trimmed) throw new Error('No content to convert.')

  const source = document.createElement('div')
  source.className = 'doc-page-content'
  source.innerHTML = trimmed

  const host = createMeasureHost()

  try {
    const blocks = collectBlockNodes(source)
    const pages = paginateHtmlBlocks(blocks, host)
    const pdf = await PDFDocument.create()

    for (const page of pages) {
      const pngBytes = await renderPageToPdfImage(page)
      const pdfPage = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      const image = await pdf.embedPng(pngBytes)
      pdfPage.drawImage(image, {
        x: 0,
        y: 0,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
      })
    }

    const bytes = await pdf.save()
    const copy = new Uint8Array(bytes.length)
    copy.set(bytes)
    const blob = new Blob([copy], { type: 'application/pdf' })

    return {
      blob,
      filename,
      originalSize: new Blob([trimmed]).size,
      outputSize: blob.size,
      pageCount: pages.length,
    }
  } finally {
    document.body.removeChild(host)
  }
}
