import QRCodeStyling, { type FileExtension } from 'qr-code-styling'
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Coffee,
  Copy,
  Download,
  Eraser,
  ImagePlus,
  Loader2,
  RotateCw,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { openDonatePage } from '../api/config'
import { qrCodeGeneratorConfig, whyCrafvia } from '../config/tools'
import {
  buildQrPayload,
  CONTENT_TYPE_OPTIONS,
  createDefaultQrFields,
  ERROR_CORRECTION_OPTIONS,
  readLogoDataUrl,
  resolveQrSize,
  SIZE_OPTIONS,
  validateQrInput,
  type QrContentType,
  type QrErrorCorrection,
  type QrFormFields,
  type QrSizePreset,
} from '../utils/qrCode'
import {
  copyQrCodeImage,
  createQrCodeStyling,
  downloadQrCode,
} from '../utils/qrCodeGenerator'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import './CompressImage.css'

const config = qrCodeGeneratorConfig

const SOCIAL_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
] as const

const WIFI_ENCRYPTION_OPTIONS = [
  { value: 'WPA', label: 'WPA / WPA2' },
  { value: 'WEP', label: 'WEP' },
  { value: 'nopass', label: 'No Password' },
] as const

export function QrCodeGeneratorPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [contentType, setContentType] = useState<QrContentType>('url')
  const [fields, setFields] = useState<QrFormFields>(createDefaultQrFields)
  const [sizePreset, setSizePreset] = useState<QrSizePreset>('medium')
  const [customSize, setCustomSize] = useState(384)
  const [errorCorrection, setErrorCorrection] = useState<QrErrorCorrection>('medium')
  const [foregroundColor, setForegroundColor] = useState('#111827')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [transparentBackground, setTransparentBackground] = useState(false)
  const [margin, setMargin] = useState(2)
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>()
  const [logoName, setLogoName] = useState<string | null>(null)
  const [hasPreview, setHasPreview] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copyMessage, setCopyMessage] = useState<string | null>(null)

  const qrRef = useRef<QRCodeStyling | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const updateField = <K extends keyof QrFormFields>(key: K, value: QrFormFields[K]) => {
    setFields((current) => ({ ...current, [key]: value }))
  }

  const resetMessages = () => {
    setError(null)
    setSuccess(null)
    setCopyMessage(null)
  }

  const renderQrCode = async (showSuccessMessage = true) => {
    const validationError = validateQrInput(contentType, fields)
    if (validationError) {
      setError(validationError)
      setHasPreview(false)
      return false
    }

    const data = buildQrPayload(contentType, fields)
    const size = resolveQrSize(sizePreset, customSize)
    const options = {
      data,
      size,
      margin,
      errorCorrection,
      foregroundColor,
      backgroundColor,
      transparentBackground,
      logoDataUrl,
    }

    if (!qrRef.current) {
      qrRef.current = createQrCodeStyling(options)
      if (previewRef.current) {
        previewRef.current.innerHTML = ''
        qrRef.current.append(previewRef.current)
      }
    } else {
      qrRef.current.update(options)
    }

    setHasPreview(true)
    if (showSuccessMessage) {
      setSuccess('QR code generated successfully.')
    }
    setError(null)
    return true
  }

  const handleGenerate = async () => {
    resetMessages()
    setIsProcessing(true)
    try {
      await renderQrCode(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate QR code.')
      setHasPreview(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRegenerate = async () => {
    resetMessages()
    setIsProcessing(true)
    try {
      await renderQrCode(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to regenerate QR code.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopy = async () => {
    resetMessages()
    if (!qrRef.current) {
      setError('Generate a QR code first.')
      return
    }

    try {
      await copyQrCodeImage(qrRef.current)
      setCopyMessage('QR code copied to clipboard.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to copy QR code.')
    }
  }

  const handleDownload = async (extension: FileExtension) => {
    resetMessages()
    if (!qrRef.current) {
      setError('Generate a QR code first.')
      return
    }

    try {
      await downloadQrCode(qrRef.current, extension, 'qrcode')
      setSuccess(`Downloaded qrcode.${extension}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to download QR code.')
    }
  }

  const handleClear = () => {
    setFields(createDefaultQrFields())
    setLogoDataUrl(undefined)
    setLogoName(null)
    setHasPreview(false)
    setError(null)
    setSuccess(null)
    setCopyMessage(null)
    qrRef.current = null
    if (previewRef.current) previewRef.current.innerHTML = ''
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  const handleLogoChange = async (file: File | undefined) => {
    resetMessages()
    if (!file) {
      setLogoDataUrl(undefined)
      setLogoName(null)
      return
    }

    try {
      const dataUrl = await readLogoDataUrl(file)
      setLogoDataUrl(dataUrl)
      setLogoName(file.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload logo.')
      setLogoDataUrl(undefined)
      setLogoName(null)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  useEffect(() => {
    if (!hasPreview) return undefined
    if (validateQrInput(contentType, fields)) return undefined

    const timer = window.setTimeout(() => {
      void renderQrCode(false)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [
    hasPreview,
    contentType,
    fields,
    sizePreset,
    customSize,
    errorCorrection,
    foregroundColor,
    backgroundColor,
    transparentBackground,
    margin,
    logoDataUrl,
  ])

  const donateBar = (
    <div className="tool-donate-bar">
      <Coffee size={16} aria-hidden />
      <span>
        Enjoying this tool?{' '}
        <a
          href="#donate"
          onClick={(e) => {
            e.preventDefault()
            void openDonatePage()
          }}
        >
          Buy us a coffee!
        </a>
      </span>
    </div>
  )

  const renderTypeFields = () => {
    switch (contentType) {
      case 'url':
        return (
          <input
            className="tool-select"
            value={fields.content}
            onChange={(e) => updateField('content', e.target.value)}
            placeholder="https://example.com"
          />
        )
      case 'text':
      case 'custom':
        return (
          <textarea
            className="tool-textarea"
            value={fields.content}
            onChange={(e) => updateField('content', e.target.value)}
            placeholder="Enter the text for your QR code"
          />
        )
      case 'email':
        return (
          <>
            <input
              className="tool-select"
              value={fields.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="name@example.com"
            />
            <input
              className="tool-select"
              value={fields.emailSubject}
              onChange={(e) => updateField('emailSubject', e.target.value)}
              placeholder="Email subject (optional)"
            />
            <textarea
              className="tool-textarea"
              value={fields.emailBody}
              onChange={(e) => updateField('emailBody', e.target.value)}
              placeholder="Email body (optional)"
            />
          </>
        )
      case 'phone':
        return (
          <input
            className="tool-select"
            value={fields.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="+1 555 123 4567"
          />
        )
      case 'sms':
        return (
          <>
            <input
              className="tool-select"
              value={fields.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+1 555 123 4567"
            />
            <textarea
              className="tool-textarea"
              value={fields.smsBody}
              onChange={(e) => updateField('smsBody', e.target.value)}
              placeholder="SMS message (optional)"
            />
          </>
        )
      case 'whatsapp':
        return (
          <>
            <input
              className="tool-select"
              value={fields.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+1 555 123 4567"
            />
            <textarea
              className="tool-textarea"
              value={fields.whatsappMessage}
              onChange={(e) => updateField('whatsappMessage', e.target.value)}
              placeholder="WhatsApp message (optional)"
            />
          </>
        )
      case 'wifi':
        return (
          <>
            <input
              className="tool-select"
              value={fields.wifiSsid}
              onChange={(e) => updateField('wifiSsid', e.target.value)}
              placeholder="WiFi network name (SSID)"
            />
            <select
              className="tool-select"
              value={fields.wifiEncryption}
              onChange={(e) =>
                updateField('wifiEncryption', e.target.value as QrFormFields['wifiEncryption'])
              }
            >
              {WIFI_ENCRYPTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fields.wifiEncryption !== 'nopass' && (
              <input
                className="tool-select"
                value={fields.wifiPassword}
                onChange={(e) => updateField('wifiPassword', e.target.value)}
                placeholder="WiFi password"
                type="password"
              />
            )}
            <label className="tool-text-counts">
              <input
                type="checkbox"
                checked={fields.wifiHidden}
                onChange={(e) => updateField('wifiHidden', e.target.checked)}
              />{' '}
              Hidden network
            </label>
          </>
        )
      case 'vcard':
        return (
          <>
            <input
              className="tool-select"
              value={fields.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              placeholder="First name"
            />
            <input
              className="tool-select"
              value={fields.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              placeholder="Last name"
            />
            <input
              className="tool-select"
              value={fields.vcardPhone}
              onChange={(e) => updateField('vcardPhone', e.target.value)}
              placeholder="Phone number"
            />
            <input
              className="tool-select"
              value={fields.vcardEmail}
              onChange={(e) => updateField('vcardEmail', e.target.value)}
              placeholder="Email address"
            />
            <input
              className="tool-select"
              value={fields.organization}
              onChange={(e) => updateField('organization', e.target.value)}
              placeholder="Organization (optional)"
            />
            <input
              className="tool-select"
              value={fields.website}
              onChange={(e) => updateField('website', e.target.value)}
              placeholder="Website (optional)"
            />
          </>
        )
      case 'social':
        return (
          <>
            <select
              className="tool-select"
              value={fields.socialPlatform}
              onChange={(e) =>
                updateField('socialPlatform', e.target.value as QrFormFields['socialPlatform'])
              }
            >
              {SOCIAL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              className="tool-select"
              value={fields.socialHandle}
              onChange={(e) => updateField('socialHandle', e.target.value)}
              placeholder="@username or profile URL"
            />
          </>
        )
      case 'maps':
        return (
          <input
            className="tool-select"
            value={fields.mapsQuery}
            onChange={(e) => updateField('mapsQuery', e.target.value)}
            placeholder="Address, place name, or coordinates"
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="app tool-page">
      <Header />
      <main className="tool-main">
        <div className="tool-container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={14} aria-hidden />
            <span>{config.category}</span>
            <ChevronRight size={14} aria-hidden />
            <span className="breadcrumb-current">{config.breadcrumb}</span>
          </nav>

          <header className="tool-header">
            <h1 className="tool-title">{config.title}</h1>
            <p className="tool-lead">{config.lead}</p>
          </header>

          <div className="upload-outer">
            <div className="tool-controls">
              <label className="tool-control-label" htmlFor="qr-type">
                QR code type
              </label>
              <select
                id="qr-type"
                className="tool-select"
                value={contentType}
                onChange={(e) => {
                  setContentType(e.target.value as QrContentType)
                  resetMessages()
                }}
              >
                {CONTENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="tool-controls">
              <label className="tool-control-label">Content</label>
              {renderTypeFields()}
            </div>

            <div className="tool-controls">
              <label className="tool-control-label" htmlFor="qr-size">
                QR size
              </label>
              <select
                id="qr-size"
                className="tool-select"
                value={sizePreset}
                onChange={(e) => setSizePreset(e.target.value as QrSizePreset)}
              >
                {SIZE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {sizePreset === 'custom' && (
              <div className="tool-controls">
                <label className="tool-control-label" htmlFor="custom-size">
                  Custom size (px)
                </label>
                <input
                  id="custom-size"
                  type="number"
                  className="tool-select"
                  min={128}
                  max={1024}
                  value={customSize}
                  onChange={(e) => setCustomSize(Number(e.target.value))}
                />
              </div>
            )}

            <div className="tool-controls">
              <label className="tool-control-label" htmlFor="qr-error-correction">
                Error correction
              </label>
              <select
                id="qr-error-correction"
                className="tool-select"
                value={errorCorrection}
                onChange={(e) => setErrorCorrection(e.target.value as QrErrorCorrection)}
              >
                {ERROR_CORRECTION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="tool-controls">
              <label className="tool-control-label">Colors</label>
              <div className="tool-qr-color-row">
                <label className="tool-qr-color-field">
                  <span>Foreground</span>
                  <input
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                  />
                </label>
                <label className="tool-qr-color-field">
                  <span>Background</span>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    disabled={transparentBackground}
                  />
                </label>
              </div>
              <label className="tool-text-counts">
                <input
                  type="checkbox"
                  checked={transparentBackground}
                  onChange={(e) => setTransparentBackground(e.target.checked)}
                />{' '}
                Transparent background (PNG / WebP)
              </label>
            </div>

            <div className="tool-controls">
              <label className="tool-control-label" htmlFor="qr-margin">
                Margin ({margin})
              </label>
              <input
                id="qr-margin"
                type="range"
                className="tool-slider"
                min={0}
                max={8}
                step={1}
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
              />
            </div>

            <div className="tool-controls">
              <label className="tool-control-label" htmlFor="qr-logo">
                Center logo (optional)
              </label>
              <button
                type="button"
                className="tool-secondary-btn"
                onClick={() => logoInputRef.current?.click()}
              >
                <ImagePlus size={16} aria-hidden />
                {logoName ? logoName : 'Upload logo'}
              </button>
              <input
                ref={logoInputRef}
                id="qr-logo"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="upload-input"
                onChange={(e) => void handleLogoChange(e.target.files?.[0])}
              />
            </div>

            <button
              type="button"
              className="tool-compress-btn"
              onClick={() => void handleGenerate()}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="spin" aria-hidden />
                  {config.processingLabel}
                </>
              ) : (
                config.actionLabel
              )}
            </button>

            <div className="tool-editor-actions">
              <button
                type="button"
                className="tool-secondary-btn"
                onClick={() => void handleRegenerate()}
                disabled={isProcessing}
              >
                <RotateCw size={16} aria-hidden />
                Regenerate
              </button>
              <button
                type="button"
                className="tool-secondary-btn"
                onClick={() => void handleCopy()}
                disabled={!hasPreview}
              >
                <Copy size={16} aria-hidden />
                Copy image
              </button>
              <button
                type="button"
                className="tool-secondary-btn"
                onClick={() => void handleDownload('png')}
                disabled={!hasPreview}
              >
                <Download size={16} aria-hidden />
                PNG
              </button>
              <button
                type="button"
                className="tool-secondary-btn"
                onClick={() => void handleDownload('svg')}
                disabled={!hasPreview}
              >
                <Download size={16} aria-hidden />
                SVG
              </button>
              <button
                type="button"
                className="tool-secondary-btn"
                onClick={() => void handleDownload('jpeg')}
                disabled={!hasPreview}
              >
                <Download size={16} aria-hidden />
                JPEG
              </button>
              <button
                type="button"
                className="tool-secondary-btn"
                onClick={() => void handleDownload('webp')}
                disabled={!hasPreview}
              >
                <Download size={16} aria-hidden />
                WEBP
              </button>
              <button type="button" className="tool-secondary-btn" onClick={handleClear}>
                <Eraser size={16} aria-hidden />
                Clear
              </button>
            </div>

            {error && <p className="tool-error">{error}</p>}
            {success && (
              <div className="tool-result">
                <p className="tool-result-stats">{success}</p>
              </div>
            )}
            {copyMessage && (
              <div className="tool-result">
                <p className="tool-result-stats">{copyMessage}</p>
              </div>
            )}

            <div className="tool-controls">
              <label className="tool-control-label">QR code preview</label>
              <div className={`tool-qr-preview ${hasPreview ? 'tool-qr-preview-ready' : ''}`}>
                <div ref={previewRef} className="tool-qr-preview-canvas" />
                {!hasPreview && (
                  <p className="tool-qr-preview-placeholder">
                    Your QR code preview will appear here.
                  </p>
                )}
              </div>
            </div>
          </div>

          {donateBar}

          <article className="tool-content-block">
            <h2>{config.whatIsTitle}</h2>
            <p>{config.whatIsBody}</p>
          </article>

          <article className="tool-content-block">
            <h2>{config.howToTitle}</h2>
            <ol className="tool-steps">
              {config.howToSteps.map((step, i) => (
                <li key={step}>
                  <span className="step-num">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </article>

          <article className="tool-content-block">
            <h2>Why Crafvia?</h2>
            <ul className="tool-checklist">
              {whyCrafvia.map((item) => (
                <li key={item}>
                  <Check size={18} strokeWidth={2.5} aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <section className="tool-content-block tool-faq-block">
            <h2>FAQ</h2>
            <ul className="tool-faq-list">
              {config.faqs.map((faq, index) => {
                const isOpen = openFaq === index
                return (
                  <li key={faq.question}>
                    <button
                      type="button"
                      className={`tool-faq-item ${isOpen ? 'tool-faq-item-open' : ''}`}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown size={20} aria-hidden />
                    </button>
                    {isOpen && (
                      <div className="tool-faq-answer">{faq.answer}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="tool-content-block">
            <h2>{config.popularTitle}</h2>
            <ul className="option-pills">
              {config.popularOptions.map((option) => (
                <li key={option.label}>
                  {option.href ? (
                    <Link to={option.href} className="option-pill">
                      {option.label}
                      <ArrowRight size={16} aria-hidden />
                    </Link>
                  ) : (
                    <a href="#" className="option-pill">
                      {option.label}
                      <ArrowRight size={16} aria-hidden />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="tool-content-block related-tools-section">
            <h2>Related Tools</h2>
            <ul className="related-tools-grid related-tools-grid-3">
              {config.relatedTools.map((tool) => {
                const Icon = tool.icon
                const isInternal = tool.href.startsWith('/')
                return (
                  <li key={tool.name}>
                    {isInternal ? (
                      <Link to={tool.href} className="related-tool-card">
                        <span className="related-tool-icon">
                          <Icon size={20} strokeWidth={2} aria-hidden />
                        </span>
                        <span className="related-tool-text">
                          <span className="related-tool-name">{tool.name}</span>
                          <span className="related-tool-desc">
                            {tool.description}
                          </span>
                        </span>
                        <ArrowRight
                          className="related-tool-arrow"
                          size={18}
                          aria-hidden
                        />
                      </Link>
                    ) : (
                      <a href={tool.href} className="related-tool-card">
                        <span className="related-tool-icon">
                          <Icon size={20} strokeWidth={2} aria-hidden />
                        </span>
                        <span className="related-tool-text">
                          <span className="related-tool-name">{tool.name}</span>
                          <span className="related-tool-desc">
                            {tool.description}
                          </span>
                        </span>
                        <ArrowRight
                          className="related-tool-arrow"
                          size={18}
                          aria-hidden
                        />
                      </a>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
