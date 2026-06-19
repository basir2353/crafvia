import { Router } from 'express'
import multer from 'multer'
import { env } from '../config/env.js'
import { optionalAuth, type AuthRequest } from '../middleware/auth.js'
import { compressRateLimit } from '../middleware/rateLimit.js'
import { protectPdf, unlockPdf } from '../services/pdfProtect.js'
import { convertWordToPdf } from '../services/wordConvert.js'
import {
  assertUsageAllowed,
  getMaxFileBytes,
  recordJob,
} from '../services/usageService.js'
import { recordPdfMergeJobSchema } from '../validators/pdf.js'

function createUpload(plan: 'FREE' | 'PRO') {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: getMaxFileBytes(plan) },
  })
}

export const pdfRouter = Router()

pdfRouter.use(compressRateLimit)
pdfRouter.use(optionalAuth)

pdfRouter.get('/merge/limits', (req, res) => {
  const plan = (req as AuthRequest).user?.plan ?? 'FREE'
  res.json({
    plan,
    maxFileMb: plan === 'PRO' ? env.PRO_MAX_FILE_MB : env.FREE_MAX_FILE_MB,
    maxFiles: plan === 'PRO' ? 100 : 50,
    dailyJobs: plan === 'PRO' ? env.PRO_DAILY_JOBS : env.FREE_DAILY_JOBS,
    clientSideProcessing: true,
  })
})

pdfRouter.post('/merge/complete', async (req, res, next) => {
  try {
    const authReq = req as AuthRequest
    const parsed = recordPdfMergeJobSchema.safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid job metadata' })
      return
    }

    await recordJob({
      userId: authReq.user?.sub,
      toolSlug: 'merge-pdf',
      originalSize: parsed.data.originalSize,
      compressedSize: parsed.data.outputSize,
      status: 'COMPLETED',
    })

    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

pdfRouter.post('/protect', (req, res, next) => {
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

      await assertUsageAllowed(authReq.user, req.file.size, 'protect-pdf')

      const password = String(req.body.password ?? '').trim()
      const ownerPassword = String(req.body.ownerPassword ?? '').trim()

      const result = await protectPdf(
        req.file.buffer,
        password,
        ownerPassword || undefined,
      )

      await recordJob({
        userId: authReq.user?.sub,
        toolSlug: 'protect-pdf',
        originalSize: result.originalSize,
        compressedSize: result.outputSize,
        status: 'COMPLETED',
      })

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename="protected.pdf"')
      res.setHeader('X-Original-Size', String(result.originalSize))
      res.setHeader('X-Compressed-Size', String(result.outputSize))
      res.send(result.buffer)
    } catch (error) {
      const authReq = req as AuthRequest
      if (req.file) {
        await recordJob({
          userId: authReq.user?.sub,
          toolSlug: 'protect-pdf',
          originalSize: req.file.size,
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Protection failed',
        }).catch(() => {})
      }
      next(error)
    }
  })
})

pdfRouter.post('/unlock', (req, res, next) => {
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

      await assertUsageAllowed(authReq.user, req.file.size, 'unlock-pdf')

      const password = String(req.body.password ?? '').trim()
      const result = await unlockPdf(req.file.buffer, password)

      await recordJob({
        userId: authReq.user?.sub,
        toolSlug: 'unlock-pdf',
        originalSize: result.originalSize,
        compressedSize: result.outputSize,
        status: 'COMPLETED',
      })

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename="unlocked.pdf"')
      res.setHeader('X-Original-Size', String(result.originalSize))
      res.setHeader('X-Compressed-Size', String(result.outputSize))
      res.send(result.buffer)
    } catch (error) {
      const authReq = req as AuthRequest
      if (req.file) {
        await recordJob({
          userId: authReq.user?.sub,
          toolSlug: 'unlock-pdf',
          originalSize: req.file.size,
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unlock failed',
        }).catch(() => {})
      }
      next(error)
    }
  })
})

pdfRouter.post('/word-to-pdf', (req, res, next) => {
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

      const lowerName = req.file.originalname.toLowerCase()
      const extension = lowerName.endsWith('.doc') && !lowerName.endsWith('.docx')
        ? '.doc'
        : '.docx'

      if (!lowerName.endsWith('.doc') && !lowerName.endsWith('.docx')) {
        res.status(400).json({ error: 'Please upload a .doc or .docx Word document.' })
        return
      }

      await assertUsageAllowed(authReq.user, req.file.size, 'word-to-pdf')

      const result = await convertWordToPdf(req.file.buffer, extension)

      await recordJob({
        userId: authReq.user?.sub,
        toolSlug: 'word-to-pdf',
        originalSize: result.originalSize,
        compressedSize: result.outputSize,
        status: 'COMPLETED',
      })

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename="converted.pdf"')
      res.setHeader('X-Original-Size', String(result.originalSize))
      res.setHeader('X-Compressed-Size', String(result.outputSize))
      res.setHeader('X-Page-Count', '1')
      res.send(result.buffer)
    } catch (error) {
      const authReq = req as AuthRequest
      if (req.file) {
        await recordJob({
          userId: authReq.user?.sub,
          toolSlug: 'word-to-pdf',
          originalSize: req.file.size,
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Conversion failed',
        }).catch(() => {})
      }
      next(error)
    }
  })
})
