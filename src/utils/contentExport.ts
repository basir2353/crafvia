import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'
import { htmlToPlainText } from './markdownToHtml'

export function copyHtmlToClipboard(html: string): Promise<void> {
  const plain = htmlToPlainText(html)

  if (navigator.clipboard?.write) {
    const blob = new Blob([html], { type: 'text/html' })
    const textBlob = new Blob([plain], { type: 'text/plain' })
    return navigator.clipboard.write([
      new ClipboardItem({
        'text/html': blob,
        'text/plain': textBlob,
      }),
    ])
  }

  return navigator.clipboard.writeText(plain)
}

export function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, filename)
}

export async function downloadDocxFile(html: string, filename: string) {
  const plain = htmlToPlainText(html)
  const paragraphs = plain
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(
      (block) =>
        new Paragraph({
          children: [new TextRun(block)],
        }),
    )

  const document = new Document({
    sections: [
      {
        children:
          paragraphs.length > 0
            ? paragraphs
            : [new Paragraph({ children: [new TextRun('')] })],
      },
    ],
  })

  const blob = await Packer.toBlob(document)
  saveAs(blob, filename.endsWith('.docx') ? filename : `${filename}.docx`)
}

export function buildExportFilename(topic: string, extension: string): string {
  const snippet = topic
    .trim()
    .slice(0, 40)
    .replace(/[^\w\-]+/g, '-')
    .replace(/-+/g, '-')
  return `${snippet || 'ai-content'}.${extension}`
}
