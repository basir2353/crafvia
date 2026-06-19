import { Router } from 'express'
import multer from 'multer'
import { env } from '../config/env.js'
import { optionalAuth, type AuthRequest } from '../middleware/auth.js'
import { compressRateLimit } from '../middleware/rateLimit.js'
import { compressImage } from '../services/imageCompress.js'
import { compressPdf, type PdfCompressionLevel } from '../services/pdfCompress.js'
import {
  assertUsageAllowed,
  getMaxFileBytes,
  recordJob,
} from '../services/usageService.js'

function createUpload(plan: 'FREE' | 'PRO') {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: getMaxFileBytes(plan) },
  })
}

export const compressRouter = Router()

compressRouter.use(compressRateLimit)
compressRouter.use(optionalAuth)

compressRouter.post('/image', (req, res, next) => {
  const plan = (req as AuthRequest).user?.plan ?? 'FREE'
  const upload = createUpload(plan).single('file')

  upload(req, res, async (uploadError) => {
    if (uploadError) {
      res.status(413).json({ error: uploadError.message })
      return
    }

    try {
      const authReq = req as AuthRequest
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' })
        return
      }

      await assertUsageAllowed(authReq.user, req.file.size, 'compress-image')

      const quality = Number(req.body.quality ?? 80)
      const keepExif = req.body.keepExif === 'true' && authReq.user?.plan === 'PRO'
      const result = await compressImage(req.file.buffer, { quality, keepExif })

      await recordJob({
        userId: authReq.user?.sub,
        toolSlug: 'compress-image',
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        status: 'COMPLETED',
      })

      res.setHeader('Content-Type', result.mimeType)
      res.setHeader('Content-Disposition', 'attachment; filename="compressed-image"')
      res.setHeader('X-Original-Size', String(result.originalSize))
      res.setHeader('X-Compressed-Size', String(result.compressedSize))
      res.send(result.buffer)
    } catch (error) {
      const authReq = req as AuthRequest
      if (req.file) {
        await recordJob({
          userId: authReq.user?.sub,
          toolSlug: 'compress-image',
          originalSize: req.file.size,
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Compression failed',
        }).catch(() => {})
      }
      next(error)
    }
  })
})

compressRouter.post('/jpg', (req, res, next) => {
  const plan = (req as AuthRequest).user?.plan ?? 'FREE'
  const upload = createUpload(plan).single('file')

  upload(req, res, async (uploadError) => {
    if (uploadError) {
      res.status(413).json({ error: uploadError.message })
      return
    }

    try {
      const authReq = req as AuthRequest
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' })
        return
      }

      await assertUsageAllowed(authReq.user, req.file.size, 'compress-jpg')

      const quality = Number(req.body.quality ?? 80)
      const keepExif = req.body.keepExif === 'true' && authReq.user?.plan === 'PRO'
      const result = await compressImage(req.file.buffer, {
        quality,
        format: 'jpeg',
        keepExif,
      })

      await recordJob({
        userId: authReq.user?.sub,
        toolSlug: 'compress-jpg',
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        status: 'COMPLETED',
      })

      res.setHeader('Content-Type', 'image/jpeg')
      res.setHeader('Content-Disposition', 'attachment; filename="compressed.jpg"')
      res.setHeader('X-Original-Size', String(result.originalSize))
      res.setHeader('X-Compressed-Size', String(result.compressedSize))
      res.send(result.buffer)
    } catch (error) {
      const authReq = req as AuthRequest
      if (req.file) {
        await recordJob({
          userId: authReq.user?.sub,
          toolSlug: 'compress-jpg',
          originalSize: req.file.size,
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Compression failed',
        }).catch(() => {})
      }
      next(error)
    }
  })
})

compressRouter.post('/png', (req, res, next) => {
  const plan = (req as AuthRequest).user?.plan ?? 'FREE'
  const upload = createUpload(plan).single('file')

  upload(req, res, async (uploadError) => {
    if (uploadError) {
      res.status(413).json({ error: uploadError.message })
      return
    }

    try {
      const authReq = req as AuthRequest
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' })
        return
      }

      await assertUsageAllowed(authReq.user, req.file.size, 'compress-png')

      const quality = Number(req.body.quality ?? 80)
      const result = await compressImage(req.file.buffer, {
        quality,
        format: 'png',
      })

      await recordJob({
        userId: authReq.user?.sub,
        toolSlug: 'compress-png',
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        status: 'COMPLETED',
      })

      res.setHeader('Content-Type', 'image/png')
      res.setHeader('Content-Disposition', 'attachment; filename="compressed.png"')
      res.setHeader('X-Original-Size', String(result.originalSize))
      res.setHeader('X-Compressed-Size', String(result.compressedSize))
      res.send(result.buffer)
    } catch (error) {
      const authReq = req as AuthRequest
      if (req.file) {
        await recordJob({
          userId: authReq.user?.sub,
          toolSlug: 'compress-png',
          originalSize: req.file.size,
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Compression failed',
        }).catch(() => {})
      }
      next(error)
    }
  })
})

compressRouter.post('/pdf', (req, res, next) => {
  const plan = (req as AuthRequest).user?.plan ?? 'FREE'
  const upload = createUpload(plan).single('file')

  upload(req, res, async (uploadError) => {
    if (uploadError) {
      res.status(413).json({ error: uploadError.message })
      return
    }

    try {
      const authReq = req as AuthRequest
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' })
        return
      }

      await assertUsageAllowed(authReq.user, req.file.size, 'compress-pdf')

      const level = (req.body.level ?? 'medium') as PdfCompressionLevel
      if (!['low', 'medium', 'high'].includes(level)) {
        res.status(400).json({ error: 'Invalid compression level' })
        return
      }

      const result = await compressPdf(req.file.buffer, level)

      await recordJob({
        userId: authReq.user?.sub,
        toolSlug: 'compress-pdf',
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        status: 'COMPLETED',
      })

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename="compressed.pdf"')
      res.setHeader('X-Original-Size', String(result.originalSize))
      res.setHeader('X-Compressed-Size', String(result.compressedSize))
      res.send(result.buffer)
    } catch (error) {
      const authReq = req as AuthRequest
      if (req.file) {
        await recordJob({
          userId: authReq.user?.sub,
          toolSlug: 'compress-pdf',
          originalSize: req.file.size,
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Compression failed',
        }).catch(() => {})
      }
      next(error)
    }
  })
})

function imageCompressHandler(
  toolSlug: string,
  format: 'webp' | 'gif',
  mimeType: string,
  defaultFilename: string,
) {
  return (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    const plan = (req as AuthRequest).user?.plan ?? 'FREE'
    const upload = createUpload(plan).single('file')

    upload(req, res, async (uploadError) => {
      if (uploadError) {
        res.status(413).json({ error: uploadError.message })
        return
      }

      try {
        const authReq = req as AuthRequest
        if (!req.file) {
          res.status(400).json({ error: 'No file uploaded' })
          return
        }

        await assertUsageAllowed(authReq.user, req.file.size, toolSlug)

        const quality = Number(req.body.quality ?? 80)
        const result = await compressImage(req.file.buffer, { quality, format })

        await recordJob({
          userId: authReq.user?.sub,
          toolSlug,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          status: 'COMPLETED',
        })

        res.setHeader('Content-Type', mimeType)
        res.setHeader('Content-Disposition', `attachment; filename="${defaultFilename}"`)
        res.setHeader('X-Original-Size', String(result.originalSize))
        res.setHeader('X-Compressed-Size', String(result.compressedSize))
        res.send(result.buffer)
      } catch (error) {
        const authReq = req as AuthRequest
        if (req.file) {
          await recordJob({
            userId: authReq.user?.sub,
            toolSlug,
            originalSize: req.file.size,
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Compression failed',
          }).catch(() => {})
        }
        next(error)
      }
    })
  }
}

compressRouter.post('/webp', imageCompressHandler('compress-webp', 'webp', 'image/webp', 'compressed.webp'))
compressRouter.post('/gif', imageCompressHandler('compress-gif', 'gif', 'image/gif', 'compressed.gif'))

compressRouter.get('/limits', (req, res) => {
  const plan = (req as AuthRequest).user?.plan ?? 'FREE'
  res.json({
    plan,
    maxFileMb: plan === 'PRO' ? env.PRO_MAX_FILE_MB : env.FREE_MAX_FILE_MB,
    dailyJobs: plan === 'PRO' ? env.PRO_DAILY_JOBS : env.FREE_DAILY_JOBS,
    batchSupported: plan === 'PRO',
    keepExifSupported: plan === 'PRO',
  })
})
