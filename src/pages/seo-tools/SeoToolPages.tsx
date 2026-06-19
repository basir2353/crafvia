import { useMemo, useState } from 'react'
import { processSeoLocal } from '../../api/seoTools'
import { SeoOutputActions, SeoToolShell } from '../../components/SeoToolShell'
import {
  backlinkCheckerConfig,
  canonicalCheckerConfig,
  headingAnalyzerConfig,
  keywordDensityConfig,
  metaTagGeneratorConfig,
  openGraphPreviewConfig,
  pageSpeedTipsConfig,
  robotsTxtConfig,
  schemaMarkupConfig,
  sitemapGeneratorConfig,
  slugGeneratorConfig,
} from '../../config/seoTools'
import type { KeywordDensityRow, SchemaType } from '../../utils/seoProcess'

function useSeoState() {
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const resetMessages = () => {
    setError(null)
    setSuccess(null)
  }

  return { output, setOutput, error, setError, success, setSuccess, resetMessages }
}

function StatusMessages({ error, success }: { error: string | null; success: string | null }) {
  if (!error && !success) return null
  return (
    <div className="tool-controls">
      {error && <p className="tool-error">{error}</p>}
      {success && <p className="tool-result-stats">{success}</p>}
    </div>
  )
}

export function MetaTagGeneratorPage() {
  const { output, setOutput, error, setError, success, setSuccess, resetMessages } = useSeoState()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [keywords, setKeywords] = useState('')
  const [canonical, setCanonical] = useState('')
  const [ogTitle, setOgTitle] = useState('')
  const [ogDescription, setOgDescription] = useState('')
  const [ogImage, setOgImage] = useState('')
  const [ogUrl, setOgUrl] = useState('')
  const [siteName, setSiteName] = useState('')
  const [twitterCard, setTwitterCard] = useState('summary_large_image')

  const preview = useMemo(() => {
    const result = processSeoLocal('meta-tag-generator', {
      options: { title, description, keywords, canonical, ogTitle, ogDescription, ogImage, ogUrl, siteName, twitterCard },
    })
    if (result.error) return null
    return result.meta?.preview as { title: string; description: string; url: string; image: string } | undefined
  }, [title, description, keywords, canonical, ogTitle, ogDescription, ogImage, ogUrl, siteName, twitterCard])

  const handleGenerate = () => {
    resetMessages()
    const result = processSeoLocal('meta-tag-generator', {
      options: { title, description, keywords, canonical, ogTitle, ogDescription, ogImage, ogUrl, siteName, twitterCard },
    })
    if (result.error) {
      setError(result.error)
      setOutput('')
      return
    }
    setOutput(result.output ?? '')
    setSuccess('Meta tags generated.')
  }

  return (
    <SeoToolShell config={metaTagGeneratorConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="meta-title">Page title</label>
        <input id="meta-title" className="tool-select" value={title} onChange={(e) => { setTitle(e.target.value); resetMessages() }} placeholder="My Page Title" />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="meta-desc">Meta description</label>
        <textarea id="meta-desc" className="tool-textarea" value={description} onChange={(e) => { setDescription(e.target.value); resetMessages() }} placeholder="A compelling description for search results…" rows={3} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="meta-keywords">Meta keywords</label>
        <input id="meta-keywords" className="tool-select" value={keywords} onChange={(e) => { setKeywords(e.target.value); resetMessages() }} placeholder="keyword1, keyword2" />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="meta-canonical">Canonical URL</label>
        <input id="meta-canonical" className="tool-select" value={canonical} onChange={(e) => { setCanonical(e.target.value); resetMessages() }} placeholder="https://example.com/page" />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Open Graph</label>
        <input className="tool-select" value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} placeholder="OG title (defaults to page title)" />
        <textarea className="tool-textarea" value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} placeholder="OG description" rows={2} />
        <input className="tool-select" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="OG image URL" />
        <input className="tool-select" value={ogUrl} onChange={(e) => setOgUrl(e.target.value)} placeholder="OG URL" />
        <input className="tool-select" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Site name" />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="twitter-card">Twitter Card type</label>
        <select id="twitter-card" className="tool-select" value={twitterCard} onChange={(e) => setTwitterCard(e.target.value)}>
          <option value="summary">summary</option>
          <option value="summary_large_image">summary_large_image</option>
        </select>
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleGenerate}>Generate Meta Tags</button>
      <StatusMessages error={error} success={success} />

      {preview && (
        <div className="tool-controls">
          <label className="tool-control-label">Live preview</label>
          <div className="pdf-file-info">
            <span className="pdf-file-meta" style={{ color: '#1a0dab', fontSize: '1.1rem' }}>{preview.title || 'Page Title'}</span>
            <span className="pdf-file-meta" style={{ color: '#006621' }}>{preview.url || 'https://example.com'}</span>
            <span className="pdf-file-meta">{preview.description || 'Meta description preview…'}</span>
          </div>
          {preview.image && (
            <div className="tool-preview">
              <img src={preview.image} alt="OG preview" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
          )}
        </div>
      )}

      {output && (
        <div className="tool-controls">
          <label className="tool-control-label" htmlFor="meta-output">Generated HTML</label>
          <textarea id="meta-output" className="tool-textarea" value={output} readOnly rows={12} />
          <SeoOutputActions output={output} downloadFilename="meta-tags.html" downloadMime="text/html;charset=utf-8" downloadLabel="Download HTML" onClear={() => setOutput('')} />
        </div>
      )}
    </SeoToolShell>
  )
}

export function SitemapGeneratorPage() {
  const { output, setOutput, error, setError, success, setSuccess, resetMessages } = useSeoState()
  const [urls, setUrls] = useState('')
  const [changefreq, setChangefreq] = useState('weekly')
  const [priority, setPriority] = useState('0.8')
  const [lastmod, setLastmod] = useState(new Date().toISOString().split('T')[0])
  const [meta, setMeta] = useState<Record<string, unknown> | null>(null)

  const handleGenerate = () => {
    resetMessages()
    const result = processSeoLocal('sitemap-generator', { text: urls, options: { changefreq, priority, lastmod } })
    if (result.error) {
      setError(result.error)
      setOutput('')
      setMeta(null)
      return
    }
    setOutput(result.output ?? '')
    setMeta(result.meta ?? null)
    setSuccess(`Sitemap generated with ${String(result.meta?.urlCount ?? 0)} URL(s).`)
  }

  return (
    <SeoToolShell config={sitemapGeneratorConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="sitemap-urls">URLs (one per line)</label>
        <textarea id="sitemap-urls" className="tool-textarea" value={urls} onChange={(e) => { setUrls(e.target.value); resetMessages() }} placeholder={'https://example.com/\nhttps://example.com/about'} rows={8} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="sitemap-freq">Change frequency</label>
        <select id="sitemap-freq" className="tool-select" value={changefreq} onChange={(e) => setChangefreq(e.target.value)}>
          {['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="sitemap-priority">Priority (0.0–1.0)</label>
        <input id="sitemap-priority" className="tool-select" value={priority} onChange={(e) => setPriority(e.target.value)} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="sitemap-lastmod">Last modified</label>
        <input id="sitemap-lastmod" className="tool-select" type="date" value={lastmod} onChange={(e) => setLastmod(e.target.value)} />
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleGenerate}>Generate Sitemap</button>
      <StatusMessages error={error} success={success} />

      {meta && (
        <div className="tool-controls">
          <div className="pdf-file-info">
            <span className="pdf-file-meta">Valid URLs: {String(meta.urlCount)}</span>
            {Number(meta.invalidCount) > 0 && (
              <span className="pdf-file-meta">Invalid URLs skipped: {String(meta.invalidCount)}</span>
            )}
          </div>
        </div>
      )}

      {output && (
        <div className="tool-controls">
          <label className="tool-control-label" htmlFor="sitemap-output">XML output</label>
          <textarea id="sitemap-output" className="tool-textarea" value={output} readOnly rows={12} />
          <SeoOutputActions output={output} downloadFilename="sitemap.xml" downloadMime="application/xml;charset=utf-8" downloadLabel="Download XML" onClear={() => setOutput('')} />
        </div>
      )}
    </SeoToolShell>
  )
}

type RobotsRule = { userAgent: string; allow: string; disallow: string }

export function RobotsTxtPage() {
  const { output, setOutput, error, setError, success, setSuccess, resetMessages } = useSeoState()
  const [rules, setRules] = useState<RobotsRule[]>([{ userAgent: '*', allow: '/', disallow: '/admin/' }])
  const [sitemapUrl, setSitemapUrl] = useState('')

  const handleGenerate = () => {
    resetMessages()
    const parsed = rules.map((r) => ({
      userAgent: r.userAgent,
      allow: r.allow.split('\n').map((s) => s.trim()).filter(Boolean),
      disallow: r.disallow.split('\n').map((s) => s.trim()).filter(Boolean),
    }))
    const result = processSeoLocal('robots-txt', { options: { rules: parsed, sitemapUrl } })
    if (result.error) {
      setError(result.error)
      setOutput('')
      return
    }
    setOutput(result.output ?? '')
    setSuccess('robots.txt generated.')
  }

  return (
    <SeoToolShell config={robotsTxtConfig}>
      {rules.map((rule, index) => (
        <div key={index} className="tool-controls">
          <label className="tool-control-label">User-agent rule {index + 1}</label>
          <input className="tool-select" value={rule.userAgent} onChange={(e) => {
            const next = [...rules]
            next[index] = { ...rule, userAgent: e.target.value }
            setRules(next)
            resetMessages()
          }} placeholder="*" />
          <label className="tool-control-label">Allow paths (one per line)</label>
          <textarea className="tool-textarea" value={rule.allow} onChange={(e) => {
            const next = [...rules]
            next[index] = { ...rule, allow: e.target.value }
            setRules(next)
          }} rows={2} />
          <label className="tool-control-label">Disallow paths (one per line)</label>
          <textarea className="tool-textarea" value={rule.disallow} onChange={(e) => {
            const next = [...rules]
            next[index] = { ...rule, disallow: e.target.value }
            setRules(next)
          }} rows={2} />
        </div>
      ))}
      <div className="tool-controls">
        <button type="button" className="tool-secondary-btn" onClick={() => setRules([...rules, { userAgent: 'Googlebot', allow: '/', disallow: '' }])}>
          Add user-agent
        </button>
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="robots-sitemap">Sitemap URL</label>
        <input id="robots-sitemap" className="tool-select" value={sitemapUrl} onChange={(e) => setSitemapUrl(e.target.value)} placeholder="https://example.com/sitemap.xml" />
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleGenerate}>Generate robots.txt</button>
      <StatusMessages error={error} success={success} />
      {output && (
        <div className="tool-controls">
          <textarea className="tool-textarea" value={output} readOnly rows={10} />
          <SeoOutputActions output={output} downloadFilename="robots.txt" downloadLabel="Download robots.txt" onClear={() => setOutput('')} />
        </div>
      )}
    </SeoToolShell>
  )
}

export function OpenGraphPreviewPage() {
  const [title, setTitle] = useState('Your Page Title')
  const [description, setDescription] = useState('Your page description appears here when shared on social networks.')
  const [image, setImage] = useState('')
  const [url, setUrl] = useState('https://example.com/page')
  const [siteName, setSiteName] = useState('example.com')
  const [error, setError] = useState<string | null>(null)

  const preview = useMemo(() => {
    const result = processSeoLocal('open-graph-preview', { options: { title, description, image, url, siteName } })
    if (result.error) return null
    return result.meta as { title: string; description: string; image: string; url: string; siteName: string }
  }, [title, description, image, url, siteName])

  const validate = () => {
    const result = processSeoLocal('open-graph-preview', { options: { title, description, image, url, siteName } })
    setError(result.error ?? null)
  }

  return (
    <SeoToolShell config={openGraphPreviewConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="og-title">Title</label>
        <input id="og-title" className="tool-select" value={title} onChange={(e) => { setTitle(e.target.value); setError(null) }} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="og-desc">Description</label>
        <textarea id="og-desc" className="tool-textarea" value={description} onChange={(e) => { setDescription(e.target.value); setError(null) }} rows={3} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="og-image">Image URL</label>
        <input id="og-image" className="tool-select" value={image} onChange={(e) => { setImage(e.target.value); setError(null) }} placeholder="https://example.com/image.jpg" />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="og-url">Page URL</label>
        <input id="og-url" className="tool-select" value={url} onChange={(e) => { setUrl(e.target.value); setError(null) }} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="og-site">Site name</label>
        <input id="og-site" className="tool-select" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
      </div>
      <button type="button" className="tool-compress-btn" onClick={validate}>Update Preview</button>
      {error && <p className="tool-error">{error}</p>}

      {preview && (
        <>
          <div className="tool-controls">
            <label className="tool-control-label">Facebook-style preview</label>
            <div className="pdf-file-info">
              {preview.image && (
                <div className="tool-preview">
                  <img src={preview.image} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              )}
              <span className="pdf-file-meta" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>{preview.siteName}</span>
              <span className="pdf-file-meta" style={{ fontWeight: 600 }}>{preview.title}</span>
              <span className="pdf-file-meta">{preview.description}</span>
            </div>
          </div>
          <div className="tool-controls">
            <label className="tool-control-label">LinkedIn-style preview</label>
            <div className="pdf-file-info">
              <span className="pdf-file-meta" style={{ fontWeight: 600, fontSize: '1rem' }}>{preview.title}</span>
              <span className="pdf-file-meta">{preview.siteName}</span>
              {preview.image && (
                <div className="tool-preview">
                  <img src={preview.image} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              )}
            </div>
          </div>
          <div className="tool-controls">
            <label className="tool-control-label">X (Twitter)-style preview</label>
            <div className="pdf-file-info">
              {preview.image && (
                <div className="tool-preview">
                  <img src={preview.image} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              )}
              <span className="pdf-file-meta" style={{ fontWeight: 600 }}>{preview.title}</span>
              <span className="pdf-file-meta">{preview.description}</span>
              <span className="pdf-file-meta" style={{ color: '#6b7280' }}>{preview.url}</span>
            </div>
          </div>
        </>
      )}
    </SeoToolShell>
  )
}

const SCHEMA_TYPES: { value: SchemaType; label: string }[] = [
  { value: 'Article', label: 'Article' },
  { value: 'BlogPosting', label: 'Blog Post' },
  { value: 'Organization', label: 'Organization' },
  { value: 'WebSite', label: 'Website' },
  { value: 'LocalBusiness', label: 'Local Business' },
  { value: 'FAQPage', label: 'FAQ' },
  { value: 'Product', label: 'Product' },
  { value: 'BreadcrumbList', label: 'Breadcrumb' },
  { value: 'Person', label: 'Person' },
  { value: 'Event', label: 'Event' },
]

export function SchemaMarkupPage() {
  const { output, setOutput, error, setError, success, setSuccess, resetMessages } = useSeoState()
  const [schemaType, setSchemaType] = useState<SchemaType>('Article')
  const [fields, setFields] = useState<Record<string, string>>({})

  const setField = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }))
    resetMessages()
  }

  const handleGenerate = () => {
    resetMessages()
    const result = processSeoLocal('schema-markup', { options: { schemaType, fields } })
    if (result.error) {
      setError(result.error)
      setOutput('')
      return
    }
    setOutput(result.output ?? '')
    setSuccess('Valid JSON-LD generated.')
  }

  const renderFields = () => {
    switch (schemaType) {
      case 'Article':
      case 'BlogPosting':
        return (
          <>
            <input className="tool-select" value={fields.headline ?? ''} onChange={(e) => setField('headline', e.target.value)} placeholder="Headline *" />
            <input className="tool-select" value={fields.author ?? ''} onChange={(e) => setField('author', e.target.value)} placeholder="Author" />
            <input className="tool-select" type="date" value={fields.datePublished ?? ''} onChange={(e) => setField('datePublished', e.target.value)} />
            <input className="tool-select" value={fields.image ?? ''} onChange={(e) => setField('image', e.target.value)} placeholder="Image URL" />
            <input className="tool-select" value={fields.url ?? ''} onChange={(e) => setField('url', e.target.value)} placeholder="Article URL" />
          </>
        )
      case 'Organization':
        return (
          <>
            <input className="tool-select" value={fields.name ?? ''} onChange={(e) => setField('name', e.target.value)} placeholder="Organization name *" />
            <input className="tool-select" value={fields.url ?? ''} onChange={(e) => setField('url', e.target.value)} placeholder="Website URL" />
            <input className="tool-select" value={fields.logo ?? ''} onChange={(e) => setField('logo', e.target.value)} placeholder="Logo URL" />
          </>
        )
      case 'WebSite':
        return (
          <>
            <input className="tool-select" value={fields.name ?? ''} onChange={(e) => setField('name', e.target.value)} placeholder="Site name *" />
            <input className="tool-select" value={fields.url ?? ''} onChange={(e) => setField('url', e.target.value)} placeholder="Site URL *" />
          </>
        )
      case 'LocalBusiness':
        return (
          <>
            <input className="tool-select" value={fields.name ?? ''} onChange={(e) => setField('name', e.target.value)} placeholder="Business name *" />
            <input className="tool-select" value={fields.address ?? ''} onChange={(e) => setField('address', e.target.value)} placeholder="Street address" />
            <input className="tool-select" value={fields.telephone ?? ''} onChange={(e) => setField('telephone', e.target.value)} placeholder="Phone" />
          </>
        )
      case 'FAQPage':
        return (
          <textarea className="tool-textarea" value={fields.faqs ?? ''} onChange={(e) => setField('faqs', e.target.value)} placeholder={'Question 1 | Answer 1\nQuestion 2 | Answer 2'} rows={6} />
        )
      case 'Product':
        return (
          <>
            <input className="tool-select" value={fields.name ?? ''} onChange={(e) => setField('name', e.target.value)} placeholder="Product name *" />
            <textarea className="tool-textarea" value={fields.description ?? ''} onChange={(e) => setField('description', e.target.value)} placeholder="Description" rows={2} />
            <input className="tool-select" value={fields.price ?? ''} onChange={(e) => setField('price', e.target.value)} placeholder="Price" />
            <input className="tool-select" value={fields.currency ?? ''} onChange={(e) => setField('currency', e.target.value)} placeholder="Currency (USD)" />
            <input className="tool-select" value={fields.image ?? ''} onChange={(e) => setField('image', e.target.value)} placeholder="Image URL" />
          </>
        )
      case 'BreadcrumbList':
        return (
          <textarea className="tool-textarea" value={fields.items ?? ''} onChange={(e) => setField('items', e.target.value)} placeholder={'Home | https://example.com\nProducts | https://example.com/products'} rows={6} />
        )
      case 'Person':
        return (
          <>
            <input className="tool-select" value={fields.name ?? ''} onChange={(e) => setField('name', e.target.value)} placeholder="Name *" />
            <input className="tool-select" value={fields.jobTitle ?? ''} onChange={(e) => setField('jobTitle', e.target.value)} placeholder="Job title" />
            <input className="tool-select" value={fields.url ?? ''} onChange={(e) => setField('url', e.target.value)} placeholder="Profile URL" />
          </>
        )
      case 'Event':
        return (
          <>
            <input className="tool-select" value={fields.name ?? ''} onChange={(e) => setField('name', e.target.value)} placeholder="Event name *" />
            <input className="tool-select" type="datetime-local" value={fields.startDate ?? ''} onChange={(e) => setField('startDate', e.target.value)} />
            <input className="tool-select" value={fields.location ?? ''} onChange={(e) => setField('location', e.target.value)} placeholder="Location" />
          </>
        )
      default:
        return null
    }
  }

  return (
    <SeoToolShell config={schemaMarkupConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="schema-type">Schema type</label>
        <select id="schema-type" className="tool-select" value={schemaType} onChange={(e) => { setSchemaType(e.target.value as SchemaType); setFields({}); resetMessages() }}>
          {SCHEMA_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Fields</label>
        {renderFields()}
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleGenerate}>Generate JSON-LD</button>
      <StatusMessages error={error} success={success} />
      {output && (
        <div className="tool-controls">
          <textarea className="tool-textarea" value={output} readOnly rows={14} />
          <SeoOutputActions output={output} downloadFilename="schema.jsonld" downloadMime="application/ld+json;charset=utf-8" downloadLabel="Download JSON-LD" onClear={() => setOutput('')} />
        </div>
      )}
    </SeoToolShell>
  )
}

export function KeywordDensityPage() {
  const { output, setOutput, error, setError, success, setSuccess, resetMessages } = useSeoState()
  const [text, setText] = useState('')
  const [rows, setRows] = useState<KeywordDensityRow[]>([])
  const [totalWords, setTotalWords] = useState(0)

  const handleAnalyze = () => {
    resetMessages()
    const result = processSeoLocal('keyword-density', { text })
    if (result.error) {
      setError(result.error)
      setOutput('')
      setRows([])
      return
    }
    setOutput(result.output ?? '')
    setRows((result.meta?.rows as KeywordDensityRow[]) ?? [])
    setTotalWords(Number(result.meta?.totalWords ?? 0))
    setSuccess('Keyword density analyzed.')
  }

  return (
    <SeoToolShell config={keywordDensityConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="kd-text">Text to analyze</label>
        <textarea id="kd-text" className="tool-textarea" value={text} onChange={(e) => { setText(e.target.value); resetMessages() }} rows={10} placeholder="Paste your page content…" />
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleAnalyze}>Analyze Keywords</button>
      <StatusMessages error={error} success={success} />
      {totalWords > 0 && (
        <div className="tool-controls">
          <div className="pdf-file-info">
            <span className="pdf-file-meta">Total words: {totalWords.toLocaleString()}</span>
            <span className="pdf-file-meta">Unique keywords: {rows.length}</span>
          </div>
          {rows.slice(0, 20).map((row) => (
            <span key={row.keyword} className="pdf-file-meta">
              {row.keyword}: {row.count} ({row.density.toFixed(2)}%)
            </span>
          ))}
        </div>
      )}
      {output && (
        <div className="tool-controls">
          <textarea className="tool-textarea" value={output} readOnly rows={10} />
          <SeoOutputActions output={output} downloadFilename="keyword-density.txt" onClear={() => setOutput('')} />
        </div>
      )}
    </SeoToolShell>
  )
}

export function SlugGeneratorPage() {
  const { output, setOutput, error, setError, success, setSuccess, resetMessages } = useSeoState()
  const [text, setText] = useState('')
  const [separator, setSeparator] = useState<'-' | '_'>('-')

  const liveSlug = useMemo(() => {
    if (!text.trim()) return ''
    const result = processSeoLocal('slug-generator', { text, options: { separator } })
    return result.error ? '' : (result.output ?? '')
  }, [text, separator])

  const handleGenerate = () => {
    resetMessages()
    const result = processSeoLocal('slug-generator', { text, options: { separator } })
    if (result.error) {
      setError(result.error)
      setOutput('')
      return
    }
    setOutput(result.output ?? '')
    setSuccess('Slug generated.')
  }

  return (
    <SeoToolShell config={slugGeneratorConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="slug-text">Text</label>
        <input id="slug-text" className="tool-select" value={text} onChange={(e) => { setText(e.target.value); resetMessages() }} placeholder="My Awesome Blog Post Title!" />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="slug-sep">Separator</label>
        <select id="slug-sep" className="tool-select" value={separator} onChange={(e) => setSeparator(e.target.value as '-' | '_')}>
          <option value="-">Hyphen (-)</option>
          <option value="_">Underscore (_)</option>
        </select>
      </div>
      {liveSlug && (
        <div className="tool-controls">
          <span className="pdf-file-meta">Preview: {liveSlug}</span>
        </div>
      )}
      <button type="button" className="tool-compress-btn" onClick={handleGenerate}>Generate Slug</button>
      <StatusMessages error={error} success={success} />
      {output && (
        <div className="tool-controls">
          <input className="tool-select" value={output} readOnly />
          <SeoOutputActions output={output} onClear={() => setOutput('')} />
        </div>
      )}
    </SeoToolShell>
  )
}

export function HeadingAnalyzerPage() {
  const { output, setOutput, error, setError, success, setSuccess, resetMessages } = useSeoState()
  const [text, setText] = useState('')

  const handleAnalyze = () => {
    resetMessages()
    const result = processSeoLocal('heading-analyzer', { text })
    if (result.error) {
      setError(result.error)
      setOutput('')
      return
    }
    setOutput(result.output ?? '')
    setSuccess('Heading structure analyzed.')
  }

  return (
    <SeoToolShell config={headingAnalyzerConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="heading-text">HTML or Markdown</label>
        <textarea id="heading-text" className="tool-textarea" value={text} onChange={(e) => { setText(e.target.value); resetMessages() }} rows={12} placeholder={'<h1>Title</h1>\n<h2>Section</h2>\n\nOr:\n# Title\n## Section'} />
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleAnalyze}>Analyze Headings</button>
      <StatusMessages error={error} success={success} />
      {output && (
        <div className="tool-controls">
          <textarea className="tool-textarea" value={output} readOnly rows={12} />
          <SeoOutputActions output={output} downloadFilename="heading-analysis.txt" onClear={() => setOutput('')} />
        </div>
      )}
    </SeoToolShell>
  )
}

export function CanonicalCheckerPage() {
  const { output, setOutput, error, setError, success, setSuccess, resetMessages } = useSeoState()
  const [pageUrl, setPageUrl] = useState('')
  const [canonicalUrl, setCanonicalUrl] = useState('')

  const handleCheck = () => {
    resetMessages()
    const result = processSeoLocal('canonical-checker', { options: { pageUrl, canonicalUrl } })
    if (result.error) {
      setError(result.error)
      setOutput('')
      return
    }
    setOutput(result.output ?? '')
    setSuccess('Canonical URL checked.')
  }

  return (
    <SeoToolShell config={canonicalCheckerConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="canon-page">Page URL</label>
        <input id="canon-page" className="tool-select" value={pageUrl} onChange={(e) => { setPageUrl(e.target.value); resetMessages() }} placeholder="https://example.com/page" />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="canon-url">Canonical URL</label>
        <input id="canon-url" className="tool-select" value={canonicalUrl} onChange={(e) => { setCanonicalUrl(e.target.value); resetMessages() }} placeholder="https://example.com/page" />
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleCheck}>Check Canonical</button>
      <StatusMessages error={error} success={success} />
      {output && (
        <div className="tool-controls">
          <textarea className="tool-textarea" value={output} readOnly rows={10} />
          <SeoOutputActions output={output} onClear={() => setOutput('')} />
        </div>
      )}
    </SeoToolShell>
  )
}

export function PageSpeedTipsPage() {
  const { output, setOutput, error, setError, success, setSuccess, resetMessages } = useSeoState()
  const [pageUrl, setPageUrl] = useState('')
  const [imageCount, setImageCount] = useState('10')
  const [cssFiles, setCssFiles] = useState('3')
  const [jsFiles, setJsFiles] = useState('5')
  const [pageSizeKb, setPageSizeKb] = useState('2000')
  const [hasLazyLoad, setHasLazyLoad] = useState(false)
  const [hasCaching, setHasCaching] = useState(false)
  const [mobileOptimized, setMobileOptimized] = useState(false)
  const [usesCdn, setUsesCdn] = useState(false)
  const [usesMinification, setUsesMinification] = useState(false)

  const handleGenerate = () => {
    resetMessages()
    const result = processSeoLocal('page-speed-tips', {
      options: {
        pageUrl,
        imageCount: Number(imageCount),
        cssFiles: Number(cssFiles),
        jsFiles: Number(jsFiles),
        pageSizeKb: Number(pageSizeKb),
        hasLazyLoad,
        hasCaching,
        mobileOptimized,
        usesCdn,
        usesMinification,
      },
    })
    if (result.error) {
      setError(result.error)
      setOutput('')
      return
    }
    setOutput(result.output ?? '')
    setSuccess('Optimization tips generated.')
  }

  const checkbox = (id: string, label: string, checked: boolean, onChange: (v: boolean) => void) => (
    <label key={id} className="tool-control-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 400 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )

  return (
    <SeoToolShell config={pageSpeedTipsConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="ps-url">Page URL (optional)</label>
        <input id="ps-url" className="tool-select" value={pageUrl} onChange={(e) => setPageUrl(e.target.value)} placeholder="https://example.com" />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Page characteristics</label>
        <input className="tool-select" type="number" min="0" value={imageCount} onChange={(e) => setImageCount(e.target.value)} placeholder="Image count" />
        <input className="tool-select" type="number" min="0" value={cssFiles} onChange={(e) => setCssFiles(e.target.value)} placeholder="CSS files" />
        <input className="tool-select" type="number" min="0" value={jsFiles} onChange={(e) => setJsFiles(e.target.value)} placeholder="JS files" />
        <input className="tool-select" type="number" min="0" value={pageSizeKb} onChange={(e) => setPageSizeKb(e.target.value)} placeholder="Page size (KB)" />
      </div>
      <div className="tool-controls">
        {checkbox('lazy', 'Uses lazy loading', hasLazyLoad, setHasLazyLoad)}
        {checkbox('cache', 'Caching enabled', hasCaching, setHasCaching)}
        {checkbox('mobile', 'Mobile optimized', mobileOptimized, setMobileOptimized)}
        {checkbox('cdn', 'Uses CDN', usesCdn, setUsesCdn)}
        {checkbox('minify', 'CSS/JS minified', usesMinification, setUsesMinification)}
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleGenerate}>Get Speed Tips</button>
      <StatusMessages error={error} success={success} />
      {output && (
        <div className="tool-controls">
          <textarea className="tool-textarea" value={output} readOnly rows={16} />
          <SeoOutputActions output={output} downloadFilename="page-speed-tips.txt" onClear={() => setOutput('')} />
        </div>
      )}
    </SeoToolShell>
  )
}

export function BacklinkCheckerPage() {
  const { output, setOutput, error, setError, success, setSuccess, resetMessages } = useSeoState()
  const [targetDomain, setTargetDomain] = useState('')
  const [backlinkUrls, setBacklinkUrls] = useState('')
  const [snippets, setSnippets] = useState('')

  const handleAnalyze = () => {
    resetMessages()
    const urls = backlinkUrls.split(/\r?\n/).map((u) => u.trim()).filter(Boolean)
    const snippetLines = snippets.split(/\r?\n/)
    const snippetMap: Record<string, string> = {}
    urls.forEach((url, i) => {
      if (snippetLines[i]) snippetMap[url] = snippetLines[i]
    })

    const result = processSeoLocal('backlink-checker', {
      options: { targetDomain, backlinkUrls, snippets: snippetMap },
    })
    if (result.error) {
      setError(result.error)
      setOutput('')
      return
    }
    setOutput(result.output ?? '')
    setSuccess('Backlink URLs analyzed (demo mode).')
  }

  return (
    <SeoToolShell config={backlinkCheckerConfig}>
      <div className="tool-controls">
        <p className="pdf-file-meta">Demo mode: validates URLs and checks snippets you provide. Does not crawl the web or return live backlink counts.</p>
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="bl-domain">Target domain</label>
        <input id="bl-domain" className="tool-select" value={targetDomain} onChange={(e) => { setTargetDomain(e.target.value); resetMessages() }} placeholder="example.com" />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="bl-urls">Potential backlink URLs (one per line)</label>
        <textarea id="bl-urls" className="tool-textarea" value={backlinkUrls} onChange={(e) => { setBacklinkUrls(e.target.value); resetMessages() }} rows={6} placeholder={'https://blog.other.com/post\nhttps://news.site.com/article'} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="bl-snippets">Snippets (one per line, matching URL order)</label>
        <textarea id="bl-snippets" className="tool-textarea" value={snippets} onChange={(e) => setSnippets(e.target.value)} rows={4} placeholder={'Read more at example.com…\nLink to example.com resource'} />
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleAnalyze}>Analyze Backlinks</button>
      <StatusMessages error={error} success={success} />
      {output && (
        <div className="tool-controls">
          <textarea className="tool-textarea" value={output} readOnly rows={14} />
          <SeoOutputActions output={output} downloadFilename="backlink-analysis.txt" onClear={() => setOutput('')} />
        </div>
      )}
    </SeoToolShell>
  )
}
