import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { apiRateLimit } from './middleware/rateLimit.js'
import { authRouter } from './routes/auth.js'
import { backgroundRouter } from './routes/background.js'
import { compressRouter } from './routes/compress.js'
import { pdfRouter } from './routes/pdf.js'
import { videoRouter } from './routes/video.js'
import { speechRouter } from './routes/speech.js'
import { aiRouter } from './routes/ai.js'
import { resizeRouter } from './routes/resize.js'
import { configRouter } from './routes/config.js'
import { contentRouter } from './routes/content.js'
import { statsRouter } from './routes/stats.js'
import { subscriptionsRouter } from './routes/subscriptions.js'
import { toolsRouter } from './routes/tools.js'
import { textRouter } from './routes/text.js'
import { genRouter } from './routes/gen.js'
import { seoRouter } from './routes/seo.js'
import { devRouter } from './routes/dev.js'
import { calcRouter } from './routes/calc.js'
import { convertRouter } from './routes/convert.js'
import { compressToolRouter } from './routes/compressTool.js'
import { securityRouter } from './routes/security.js'
import { ensureDatabaseSchema } from './db/ensureSchema.js'

const publicDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../public',
)

const app = express()

app.use(helmet())
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(apiRateLimit)

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'crafvia-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/auth', authRouter)
app.use('/api/tools', toolsRouter)
app.use('/api/stats', statsRouter)
app.use('/api/config', configRouter)
app.use('/api/subscriptions', subscriptionsRouter)
app.use('/api/content', contentRouter)
app.use('/api/compress', compressRouter)
app.use('/api/background', backgroundRouter)
app.use('/api/resize', resizeRouter)
app.use('/api/pdf', pdfRouter)
app.use('/api/video', videoRouter)
app.use('/api/speech', speechRouter)
app.use('/api/ai', aiRouter)
app.use('/api/text', textRouter)
app.use('/api/gen', genRouter)
app.use('/api/seo', seoRouter)
app.use('/api/dev', devRouter)
app.use('/api/calc', calcRouter)
app.use('/api/convert', convertRouter)
app.use('/api/compress-tool', compressToolRouter)
app.use('/api/security', securityRouter)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(publicDir, { index: false, maxAge: '1d' }))
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      next()
      return
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next()
      return
    }
    res.sendFile(path.join(publicDir, 'index.html'))
  })
}

app.use(errorHandler)

async function startServer() {
  await ensureDatabaseSchema()
  app.listen(env.PORT, () => {
    console.log(`Crafvia API running on http://localhost:${env.PORT}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
