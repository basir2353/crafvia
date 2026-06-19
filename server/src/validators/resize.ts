import { z } from 'zod'

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
  '.heif',
  '.avif',
  '.bmp',
  '.tif',
  '.tiff',
  '.gif',
])

export function isAllowedResizeUpload(
  mimetype: string,
  originalname: string,
): boolean {
  const ext = originalname.includes('.')
    ? originalname.slice(originalname.lastIndexOf('.')).toLowerCase()
    : ''

  if (ALLOWED_EXTENSIONS.has(ext)) return true
  return mimetype.startsWith('image/')
}

export const resizeBodySchema = z.object({
  width: z.coerce.number().int().min(1).max(10000),
  height: z.coerce.number().int().min(1).max(10000),
  lockAspectRatio: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .transform((value) => value === true || value === 'true'),
  format: z.enum(['jpeg', 'png', 'webp']).default('jpeg'),
  quality: z.coerce.number().int().min(1).max(100).default(90),
  keepMetadata: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .transform((value) => value === true || value === 'true')
    .optional()
    .default(false),
})

export function buildResizeFilename(
  originalname: string,
  width: number,
  height: number,
  format: 'jpeg' | 'png' | 'webp',
): string {
  const base = originalname.replace(/\.[^.]+$/, '') || 'image'
  const ext = format === 'jpeg' ? 'jpg' : format
  return `${base}-${width}x${height}.${ext}`
}
