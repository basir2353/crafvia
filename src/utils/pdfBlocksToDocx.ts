import {
  Document,
  HeadingLevel,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import type { ExtractedPdfDocument, PdfContentBlock } from './pdfTextExtract'
import { documentToPlainText } from './pdfTextExtract'
import { containsRtlScript } from './pdfTextQuality'

const HEADING_LEVELS = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
} as const

function paragraphOptions(text: string, rtl: boolean) {
  return {
    bidirectional: rtl,
    children: [
      new TextRun({
        text: text || ' ',
        font: rtl ? 'Arial' : undefined,
        rightToLeft: rtl,
      }),
    ],
  }
}

function blockToDocxChildren(block: PdfContentBlock): Paragraph[] {
  const rtl = containsRtlScript(
    block.kind === 'list' ? block.items.join(' ') : block.kind === 'table'
      ? block.rows.flat().join(' ')
      : block.text,
  )

  switch (block.kind) {
    case 'heading':
      return [
        new Paragraph({
          heading: HEADING_LEVELS[block.level],
          bidirectional: rtl,
          children: [
            new TextRun({
              text: block.text,
              bold: true,
              font: rtl ? 'Arial' : undefined,
              rightToLeft: rtl,
            }),
          ],
        }),
      ]
    case 'paragraph':
      return [new Paragraph(paragraphOptions(block.text, rtl))]
    case 'list':
      return block.items.map(
        (item) =>
          new Paragraph({
            ...paragraphOptions(item, rtl),
            ...(block.ordered
              ? { numbering: { reference: 'extracted-list', level: 0 } }
              : { bullet: { level: 0 } }),
          }),
      )
    case 'table':
      return []
    default:
      return []
  }
}

function blockToDocxElements(block: PdfContentBlock): Array<Paragraph | Table> {
  if (block.kind === 'table' && block.rows.length > 0) {
    return [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: block.rows.map(
          (row) =>
            new TableRow({
              children: row.map(
                (cell) =>
                  new TableCell({
                    children: [
                      new Paragraph(
                        paragraphOptions(cell, containsRtlScript(cell)),
                      ),
                    ],
                  }),
              ),
            }),
        ),
      }),
      new Paragraph({ children: [new TextRun('')] }),
    ]
  }

  return blockToDocxChildren(block)
}

export async function extractedPdfToDocxBlob(
  document: ExtractedPdfDocument,
  filenameBase: string,
): Promise<{ blob: Blob; filename: string }> {
  const children: Array<Paragraph | Table> = []

  document.pages.forEach((page, pageIndex) => {
    if (pageIndex > 0) {
      children.push(new Paragraph({ children: [new PageBreak()] }))
    }

    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Page ${page.pageNumber}`, bold: true })],
      }),
    )

    for (const block of page.blocks) {
      children.push(...blockToDocxElements(block))
    }
  })

  if (children.length === 0) {
    children.push(
      new Paragraph({
        children: [new TextRun(documentToPlainText(document))],
      }),
    )
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'extracted-list',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: 'start',
            },
          ],
        },
      ],
    },
    sections: [{ properties: {}, children }],
  })

  const blob = await Packer.toBlob(doc)
  return {
    blob,
    filename: `${filenameBase}.docx`,
  }
}

export async function plainTextToDocxBlob(
  text: string,
  filenameBase: string,
): Promise<{ blob: Blob; filename: string }> {
  const lines = text.split('\n')
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: lines.map(
          (line) =>
            new Paragraph({
              children: [new TextRun(line || ' ')],
            }),
        ),
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  return {
    blob,
    filename: `${filenameBase}.docx`,
  }
}
