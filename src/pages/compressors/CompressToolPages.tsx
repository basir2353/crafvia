import { Download, Loader2, Shield, Upload } from 'lucide-react'
import { useMemo, useRef, useState, type DragEvent } from 'react'
import { compressGif, compressWebp, formatFileSize } from '../../api/compress'
import { processCompressLocal } from '../../api/compressTools'
import {
  CompressOutputActions,
  CompressToolShell,
  formatSavings,
} from '../../components/CompressToolShell'
import {
  compressAudioConfig,
  compressCssConfig,
  compressGifConfig,
  compressHtmlConfig,
  compressJsConfig,
  compressJsonConfig,
  compressSvgConfig,
  compressWebpConfig,
  compressXmlConfig,
  compressZipConfig,
} from '../../config/compressTools'
import type { CompressToolConfig } from '../../config/compressTools'
import type { CompressToolSlug } from '../../utils/compressProcess'
import {
  compressAudioToMp3,
  createZipArchive,
  type FileCompressResult,
  type Mp3Bitrate,
} from '../../utils/compressFileProcess'

function MinifyTextPage({
  config,
  slug,
  placeholder,
  downloadName,
  mimeType,
}: {
  config: CompressToolConfig
  slug: CompressToolSlug
  placeholder: string
  downloadName: string
  mimeType?: string
}) {
  const [input, setInput] = useState('')

  const result = useMemo(() => {
    if (!input.trim()) return null
    return processCompressLocal(slug, { text: input })
  }, [input, slug])

  const meta = result?.meta as
    | { originalBytes?: number; outputBytes?: number; savedPercent?: number }
    | undefined

  return (
    <CompressToolShell config={config}>
      <textarea
        className="tool-textarea"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        rows={12}
      />
      {result?.error && <p className="tool-error">{result.error}</p>}
      {result?.output && !result.error && (
        <>
          {meta?.originalBytes != null && meta.outputBytes != null && (
            <p className="tool-result-stats">
              {formatSavings(meta.originalBytes, meta.outputBytes)}
            </p>
          )}
          <textarea className="tool-textarea" value={result.output} readOnly rows={10} />
          <CompressOutputActions
            output={result.output}
            onClear={() => setInput('')}
            downloadName={downloadName}
            mimeType={mimeType}
          />
        </>
      )}
    </CompressToolShell>
  )
}

function ImageCompressPage({
  config,
  compressFn,
  accept,
  defaultFilename,
}: {
  config: CompressToolConfig
  compressFn: (opts: { file: File; quality: number }) => Promise<import('../../api/compress').CompressResult>
  accept: string
  defaultFilename: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [quality, setQuality] = useState(80)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<import('../../api/compress').CompressResult | null>(null)

  const handleFileChange = (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setSelectedFile(file)
    setResult(null)
    setError(null)
  }

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (isProcessing) return
    handleFileChange(event.dataTransfer.files)
  }

  const handleCompress = async () => {
    if (!selectedFile) return
    setIsProcessing(true)
    setError(null)
    setResult(null)
    try {
      const compressResult = await compressFn({ file: selectedFile, quality })
      setResult(compressResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compression failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const url = URL.createObjectURL(result.blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = result.filename || defaultFilename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const savingsPercent =
    result && result.originalSize > 0
      ? Math.round((1 - result.compressedSize / result.originalSize) * 100)
      : 0

  return (
    <CompressToolShell config={config}>
      <div className="upload-server-notice">
        <Shield size={16} aria-hidden />
        <span>Files are processed on the server and deleted immediately after compression.</span>
      </div>
      <button
        type="button"
        className={`upload-zone ${selectedFile ? 'upload-zone-has-file' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        disabled={isProcessing}
      >
        <span className="upload-icon-wrap">
          <Upload size={28} strokeWidth={2} aria-hidden />
        </span>
        <span className="upload-title">
          {selectedFile ? selectedFile.name : 'Drop your file here or click to browse'}
        </span>
        {selectedFile && (
          <span className="upload-hint">
            {formatFileSize(selectedFile.size)} — click to change file
          </span>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="upload-input"
          aria-hidden
          onChange={(e) => handleFileChange(e.target.files)}
        />
      </button>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="image-quality">
          Quality: {quality}
        </label>
        <input
          id="image-quality"
          type="range"
          min={10}
          max={100}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="tool-slider"
          disabled={isProcessing}
        />
      </div>
      <button
        type="button"
        className="tool-compress-btn"
        onClick={() => void handleCompress()}
        disabled={!selectedFile || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 size={18} className="spin" aria-hidden />
            Compressing…
          </>
        ) : (
          'Compress now'
        )}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {result && (
        <div className="tool-result">
          <p className="tool-result-stats">
            {formatFileSize(result.originalSize)} → {formatFileSize(result.compressedSize)} (
            {savingsPercent}% smaller)
          </p>
          <button type="button" className="tool-compress-btn" onClick={handleDownload}>
            <Download size={18} aria-hidden />
            Download compressed file
          </button>
        </div>
      )}
    </CompressToolShell>
  )
}

export function CompressWebpPage() {
  return (
    <ImageCompressPage
      config={compressWebpConfig}
      compressFn={compressWebp}
      accept="image/webp"
      defaultFilename="compressed.webp"
    />
  )
}

export function CompressGifPage() {
  return (
    <ImageCompressPage
      config={compressGifConfig}
      compressFn={compressGif}
      accept="image/gif"
      defaultFilename="compressed.gif"
    />
  )
}

export function CompressSvgPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [input, setInput] = useState('')
  const [fileName, setFileName] = useState('optimized.svg')

  const result = useMemo(() => {
    if (!input.trim()) return null
    return processCompressLocal('compress-svg', { text: input })
  }, [input])

  const handleFile = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    const text = await file.text()
    setInput(text)
    setFileName(file.name.replace(/\.svg$/i, '') + '-optimized.svg')
  }

  const meta = result?.meta as { originalBytes?: number; outputBytes?: number } | undefined

  return (
    <CompressToolShell config={compressSvgConfig}>
      <button
        type="button"
        className="tool-secondary-btn"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={16} aria-hidden /> Upload .svg file
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg,image/svg+xml"
        className="upload-input"
        aria-hidden
        onChange={(e) => void handleFile(e.target.files)}
      />
      <textarea
        className="tool-textarea"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste SVG markup here…"
        rows={12}
      />
      {result?.error && <p className="tool-error">{result.error}</p>}
      {result?.output && !result.error && (
        <>
          {meta?.originalBytes != null && meta.outputBytes != null && (
            <p className="tool-result-stats">
              {formatSavings(meta.originalBytes, meta.outputBytes)}
            </p>
          )}
          <textarea className="tool-textarea" value={result.output} readOnly rows={10} />
          <CompressOutputActions
            output={result.output}
            onClear={() => setInput('')}
            downloadName={fileName}
            mimeType="image/svg+xml"
          />
        </>
      )}
    </CompressToolShell>
  )
}

export function CompressAudioPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [bitrate, setBitrate] = useState<Mp3Bitrate>(128)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressMessage, setProgressMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FileCompressResult | null>(null)

  const handleCompress = async () => {
    if (!selectedFile) return
    setIsProcessing(true)
    setError(null)
    setResult(null)
    setProgressMessage('Loading media engine…')
    try {
      const output = await compressAudioToMp3(selectedFile, bitrate, {
        onStatus: setProgressMessage,
        onProgress: setProgressMessage,
      })
      setResult(output)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audio compression failed')
    } finally {
      setIsProcessing(false)
      setProgressMessage(null)
    }
  }

  const savingsPercent =
    result && result.originalSize > 0
      ? Math.round((1 - result.outputSize / result.originalSize) * 100)
      : 0

  return (
    <CompressToolShell config={compressAudioConfig}>
      <button
        type="button"
        className={`upload-zone ${selectedFile ? 'upload-zone-has-file' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
      >
        <span className="upload-icon-wrap">
          <Upload size={28} strokeWidth={2} aria-hidden />
        </span>
        <span className="upload-title">
          {selectedFile ? selectedFile.name : 'Upload audio file (MP3, WAV, M4A, OGG, FLAC)'}
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="upload-input"
          aria-hidden
          onChange={(e) => {
            setSelectedFile(e.target.files?.[0] ?? null)
            setResult(null)
            setError(null)
          }}
        />
      </button>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="audio-bitrate">
          Output quality
        </label>
        <select
          id="audio-bitrate"
          className="tool-select"
          value={bitrate}
          onChange={(e) => setBitrate(Number(e.target.value) as Mp3Bitrate)}
          disabled={isProcessing}
        >
          <option value={64}>64 kbps — smallest</option>
          <option value={96}>96 kbps</option>
          <option value={128}>128 kbps — balanced</option>
          <option value={192}>192 kbps — high quality</option>
        </select>
      </div>
      <button
        type="button"
        className="tool-compress-btn"
        onClick={() => void handleCompress()}
        disabled={!selectedFile || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 size={18} className="spin" aria-hidden />
            {progressMessage ?? 'Compressing…'}
          </>
        ) : (
          'Compress audio'
        )}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {result && (
        <div className="tool-result">
          <p className="tool-result-stats">
            {formatFileSize(result.originalSize)} → {formatFileSize(result.outputSize)} (
            {savingsPercent}% smaller)
          </p>
          <button
            type="button"
            className="tool-compress-btn"
            onClick={() => {
              const url = URL.createObjectURL(result.blob)
              const anchor = document.createElement('a')
              anchor.href = url
              anchor.download = result.filename
              anchor.click()
              URL.revokeObjectURL(url)
            }}
          >
            <Download size={18} aria-hidden />
            Download MP3
          </button>
        </div>
      )}
    </CompressToolShell>
  )
}

export function CompressZipPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FileCompressResult | null>(null)

  const handleCreate = async () => {
    setIsProcessing(true)
    setError(null)
    setResult(null)
    try {
      const output = await createZipArchive(files)
      setResult(output)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ZIP creation failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const totalInputSize = files.reduce((sum, file) => sum + file.size, 0)

  return (
    <CompressToolShell config={compressZipConfig}>
      <button
        type="button"
        className={`upload-zone ${files.length ? 'upload-zone-has-file' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
      >
        <span className="upload-icon-wrap">
          <Upload size={28} strokeWidth={2} aria-hidden />
        </span>
        <span className="upload-title">
          {files.length
            ? `${files.length} file${files.length === 1 ? '' : 's'} selected`
            : 'Select files to add to ZIP archive'}
        </span>
        {files.length > 0 && (
          <span className="upload-hint">
            {formatFileSize(totalInputSize)} total — click to change selection
          </span>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="upload-input"
          aria-hidden
          onChange={(e) => {
            setFiles(e.target.files ? [...e.target.files] : [])
            setResult(null)
            setError(null)
          }}
        />
      </button>
      {files.length > 0 && (
        <ul className="tool-result-stats">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`}>
              {file.name} ({formatFileSize(file.size)})
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className="tool-compress-btn"
        onClick={() => void handleCreate()}
        disabled={!files.length || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 size={18} className="spin" aria-hidden />
            Creating ZIP…
          </>
        ) : (
          'Create ZIP archive'
        )}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {result && (
        <div className="tool-result">
          <p className="tool-result-stats">
            Archive size: {formatFileSize(result.outputSize)} (from{' '}
            {formatFileSize(result.originalSize)} of source files)
          </p>
          <button
            type="button"
            className="tool-compress-btn"
            onClick={() => {
              const url = URL.createObjectURL(result.blob)
              const anchor = document.createElement('a')
              anchor.href = url
              anchor.download = result.filename
              anchor.click()
              URL.revokeObjectURL(url)
            }}
          >
            <Download size={18} aria-hidden />
            Download ZIP
          </button>
        </div>
      )}
    </CompressToolShell>
  )
}

export function CompressHtmlPage() {
  return (
    <MinifyTextPage
      config={compressHtmlConfig}
      slug="compress-html"
      placeholder="Paste HTML here…"
      downloadName="minified.html"
      mimeType="text/html"
    />
  )
}

export function CompressCssPage() {
  return (
    <MinifyTextPage
      config={compressCssConfig}
      slug="compress-css"
      placeholder="Paste CSS here…"
      downloadName="minified.css"
      mimeType="text/css"
    />
  )
}

export function CompressJsPage() {
  return (
    <MinifyTextPage
      config={compressJsConfig}
      slug="compress-js"
      placeholder="Paste JavaScript here…"
      downloadName="minified.js"
      mimeType="text/javascript"
    />
  )
}

export function CompressJsonPage() {
  return (
    <MinifyTextPage
      config={compressJsonConfig}
      slug="compress-json"
      placeholder='Paste JSON here… e.g. {"name":"Crafvia"}'
      downloadName="minified.json"
      mimeType="application/json"
    />
  )
}

export function CompressXmlPage() {
  return (
    <MinifyTextPage
      config={compressXmlConfig}
      slug="compress-xml"
      placeholder="Paste XML here…"
      downloadName="minified.xml"
      mimeType="application/xml"
    />
  )
}
