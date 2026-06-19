import { Router } from 'express'
import multer from 'multer'
import { optionalAuth, type AuthRequest } from '../middleware/auth.js'
import { compressRateLimit } from '../middleware/rateLimit.js'
import { resizeImage } from '../services/imageResize.js'
import {
  assertUsageAllowed,
  getMaxFileBytes,
  recordJob,
} from '../services/usageService.js'
import {
  buildResizeFilename,
  isAllowedResizeUpload,
  resizeBodySchema,
} from '../validators/resize.js'

function createUpload(plan: 'FREE' | 'PRO') {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: getMaxFileBytes(plan) },
    fileFilter: (_req, file, cb) => {
      if (!isAllowedResizeUpload(file.mimetype, file.originalname)) {
        cb(new Error('Invalid file type. Upload a supported image format.'))
        return
      }
      cb(null, true)
    },
  })
}

export const resizeRouter = Router()

resizeRouter.use(compressRateLimit)
resizeRouter.use(optionalAuth)

resizeRouter.post('/image', (req, res, next) => {
  const plan = (req as AuthRequest).user?.plan ?? 'FREE'
  const upload = createUpload(plan).single('file')

  upload(req, res, async (uploadError) => {
    if (uploadError) {
      const status = uploadError.message.includes('File too large') ? 413 : 400
      res.status(status).json({ error: uploadError.message })
      return
    }

    try {
      const authReq = req as AuthRequest
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' })
        return
      }

      if (!isAllowedResizeUpload(req.file.mimetype, req.file.originalname)) {
        res.status(400).json({ error: 'Invalid file type. Upload a supported image format.' })
        return
      }

      const parsed = resizeBodySchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid resize parameters' })
        return
      }

      await assertUsageAllowed(authReq.user, req.file.size, 'image-resizer')

      const result = await resizeImage(req.file.buffer, {
        width: parsed.data.width,
        height: parsed.data.height,
        lockAspectRatio: parsed.data.lockAspectRatio,
        format: parsed.data.format,
        quality: parsed.data.quality,
        keepMetadata: parsed.data.keepMetadata,
      })

      await recordJob({
        userId: authReq.user?.sub,
        toolSlug: 'image-resizer',
        originalSize: result.originalSize,
        compressedSize: result.outputSize,
        status: 'COMPLETED',
      })

      const filename = buildResizeFilename(
        req.file.originalname,
        result.width,
        result.height,
        parsed.data.format,
      )

      res.setHeader('Content-Type', result.mimeType)
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.setHeader('X-Original-Size', String(result.originalSize))
      res.setHeader('X-Compressed-Size', String(result.outputSize))
      res.setHeader('X-Image-Width', String(result.width))
      res.setHeader('X-Image-Height', String(result.height))
      res.send(result.buffer)
    } catch (error) {
      const authReq = req as AuthRequest
      if (req.file) {
        await recordJob({
          userId: authReq.user?.sub,
          toolSlug: 'image-resizer',
          originalSize: req.file.size,
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Resize failed',
        }).catch(() => {})
      }
      next(error)
    }
  })
})
