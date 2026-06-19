import { PDFDocument } from 'pdf-lib'
import { getUploadableImageFile } from './imagePrepare'

export type ImageToPdfResult = {
  blob: Blob
  filename: string
  pageCount: number
  originalSize: number
  outputSize: number
}

async function fileToImageBytes(file: File): Promise<{ bytes: Uint8Array; type: 'png' | 'jpg' }> {
  const uploadable = await getUploadableImageFile(file)
  const url = URL.createObjectURL(uploadable)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error(`Could not read "${file.name}".`))
      element.src = url
    })

    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not prepare image for PDF.')

    const isJpeg =
      uploadable.type.includes('jpeg') ||
      uploadable.type.includes('jpg') ||
      file.name.toLowerCase().endsWith('.jpg') ||
      file.name.toLowerCase().endsWith('.jpeg')

    if (isJpeg) {
      ctx.drawImage(img, 0, 0)
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((result) => resolve(result), 'image/jpeg', 0.92)
      })
      if (!blob) throw new Error('Could not convert image for PDF.')
      const buffer = await blob.arrayBuffer()
      return { bytes: new Uint8Array(buffer), type: 'jpg' }
    }

    ctx.drawImage(img, 0, 0)
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), 'image/png')
    })
    if (!blob) throw new Error('Could not convert image for PDF.')
    const buffer = await blob.arrayBuffer()
    return { bytes: new Uint8Array(buffer), type: 'png' }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function imagesToPdf(files: File[]): Promise<ImageToPdfResult> {
  if (files.length === 0) {
    throw new Error('Add at least one image to create a PDF.')
  }

  const pdf = await PDFDocument.create()
  let originalSize = 0

  for (const file of files) {
    originalSize += file.size
    const { bytes, type } = await fileToImageBytes(file)
    const embedded =
      type === 'jpg' ? await pdf.embedJpg(bytes) : await pdf.embedPng(bytes)
    const { width, height } = embedded.scale(1)
    const page = pdf.addPage([width, height])
    page.drawImage(embedded, { x: 0, y: 0, width, height })
  }

  const pdfBytes = await pdf.save()
  const copy = new Uint8Array(pdfBytes.length)
  copy.set(pdfBytes)

  return {
    blob: new Blob([copy], { type: 'application/pdf' }),
    filename: files.length === 1 ? 'image.pdf' : 'images.pdf',
    pageCount: files.length,
    originalSize,
    outputSize: copy.length,
  }
}
