export type SeoToolSlug =
  | 'meta-tag-generator'
  | 'sitemap-generator'
  | 'robots-txt'
  | 'open-graph-preview'
  | 'schema-markup'
  | 'keyword-density'
  | 'slug-generator'
  | 'heading-analyzer'
  | 'canonical-checker'
  | 'page-speed-tips'
  | 'backlink-checker'

export type SchemaType =
  | 'Article'
  | 'BlogPosting'
  | 'Organization'
  | 'WebSite'
  | 'LocalBusiness'
  | 'FAQPage'
  | 'Product'
  | 'BreadcrumbList'
  | 'Person'
  | 'Event'

export type SeoToolRequest = {
  text?: string
  options?: Record<string, unknown>
}

export type KeywordDensityRow = {
  keyword: string
  count: number
  density: number
}

export type HeadingEntry = {
  level: number
  tag: string
  text: string
  line?: number
}

export type HeadingIssue = {
  type: 'missing-h1' | 'duplicate-h1' | 'skipped-level' | 'empty-heading' | 'multiple-h1'
  message: string
  severity: 'error' | 'warning'
}

export type BacklinkRow = {
  url: string
  valid: boolean
  isExternal: boolean
  mentionsTarget: boolean
  notes: string[]
}

export type SeoToolResponse = {
  output?: string
  error?: string
  meta?: Record<string, unknown>
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall',
  'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'what',
  'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how', 'all', 'each', 'every',
  'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
  'own', 'same', 'so', 'than', 'too', 'very', 'just', 'about', 'above', 'after', 'again',
  'against', 'between', 'into', 'through', 'during', 'before', 'under', 'over', 'once',
  'here', 'there', 'then', 'once', 'also', 'am', 'if', 'because', 'until', 'while',
])

export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, '&#39;')
}

function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
}

function getHostname(url: string): string | null {
  try {
    return new URL(url.trim()).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function num(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function bool(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1'
}

export function generateMetaTags(options: Record<string, unknown>): SeoToolResponse {
  const title = str(options.title)
  const description = str(options.description)
  const keywords = str(options.keywords)
  const canonical = str(options.canonical)
  const ogTitle = str(options.ogTitle) || title
  const ogDescription = str(options.ogDescription) || description
  const ogImage = str(options.ogImage)
  const ogUrl = str(options.ogUrl) || canonical
  const siteName = str(options.siteName)
  const twitterCard = str(options.twitterCard) || 'summary_large_image'
  const twitterTitle = str(options.twitterTitle) || ogTitle
  const twitterDescription = str(options.twitterDescription) || ogDescription
  const twitterImage = str(options.twitterImage) || ogImage
  const robots = str(options.robots) || 'index, follow'

  if (!title && !description) {
    return { error: 'Enter at least a page title or meta description.' }
  }

  if (canonical && !isValidHttpUrl(canonical)) {
    return { error: 'Canonical URL must be a valid http or https URL.' }
  }
  if (ogUrl && !isValidHttpUrl(ogUrl)) {
    return { error: 'Open Graph URL must be a valid http or https URL.' }
  }
  if (ogImage && !isValidHttpUrl(ogImage)) {
    return { error: 'Open Graph image must be a valid http or https URL.' }
  }

  const lines: string[] = []
  if (title) lines.push(`<title>${escapeHtml(title)}</title>`)
  if (description) {
    lines.push(`<meta name="description" content="${escapeAttr(description)}">`)
  }
  if (keywords) {
    lines.push(`<meta name="keywords" content="${escapeAttr(keywords)}">`)
  }
  lines.push(`<meta name="robots" content="${escapeAttr(robots)}">`)
  if (canonical) {
    lines.push(`<link rel="canonical" href="${escapeAttr(canonical)}">`)
  }

  lines.push('')
  lines.push('<!-- Open Graph -->')
  if (ogTitle) lines.push(`<meta property="og:title" content="${escapeAttr(ogTitle)}">`)
  if (ogDescription) {
    lines.push(`<meta property="og:description" content="${escapeAttr(ogDescription)}">`)
  }
  if (ogUrl) lines.push(`<meta property="og:url" content="${escapeAttr(ogUrl)}">`)
  if (ogImage) lines.push(`<meta property="og:image" content="${escapeAttr(ogImage)}">`)
  if (siteName) lines.push(`<meta property="og:site_name" content="${escapeAttr(siteName)}">`)
  lines.push(`<meta property="og:type" content="website">`)

  lines.push('')
  lines.push('<!-- Twitter Card -->')
  lines.push(`<meta name="twitter:card" content="${escapeAttr(twitterCard)}">`)
  if (twitterTitle) lines.push(`<meta name="twitter:title" content="${escapeAttr(twitterTitle)}">`)
  if (twitterDescription) {
    lines.push(`<meta name="twitter:description" content="${escapeAttr(twitterDescription)}">`)
  }
  if (twitterImage) lines.push(`<meta name="twitter:image" content="${escapeAttr(twitterImage)}">`)

  return {
    output: lines.join('\n'),
    meta: {
      preview: {
        title: title || ogTitle,
        description: description || ogDescription,
        url: ogUrl || canonical,
        image: ogImage || twitterImage,
      },
    },
  }
}

export function generateSitemap(text: string, options: Record<string, unknown>): SeoToolResponse {
  const rawUrls = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (rawUrls.length === 0) {
    return { error: 'Enter at least one URL (one per line).' }
  }

  const changefreq = str(options.changefreq) || 'weekly'
  const priority = str(options.priority) || '0.8'
  const lastmod = str(options.lastmod) || new Date().toISOString().split('T')[0]

  const validFreq = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
  if (!validFreq.includes(changefreq)) {
    return { error: 'Change frequency must be always, hourly, daily, weekly, monthly, yearly, or never.' }
  }

  const priorityNum = Number(priority)
  if (!Number.isFinite(priorityNum) || priorityNum < 0 || priorityNum > 1) {
    return { error: 'Priority must be a number between 0.0 and 1.0.' }
  }

  const invalid: string[] = []
  const valid: string[] = []

  for (const url of rawUrls) {
    if (isValidHttpUrl(url)) {
      valid.push(url)
    } else {
      invalid.push(url)
    }
  }

  if (valid.length === 0) {
    return { error: `No valid URLs found. Invalid: ${invalid.slice(0, 3).join(', ')}` }
  }

  const urlEntries = valid
    .map(
      (url) =>
        `  <url>\n    <loc>${escapeHtml(url)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priorityNum.toFixed(1)}</priority>\n  </url>`,
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`

  const validationNotes: string[] = []
  if (!xml.includes('<?xml version="1.0"')) validationNotes.push('Missing XML declaration')
  if (!xml.includes('<urlset')) validationNotes.push('Missing urlset root element')
  if (invalid.length > 0) {
    validationNotes.push(`${invalid.length} invalid URL(s) skipped`)
  }

  return {
    output: xml,
    meta: {
      urlCount: valid.length,
      invalidCount: invalid.length,
      invalidUrls: invalid,
      valid: validationNotes.length === 0 || (validationNotes.length === 1 && invalid.length > 0),
      validationNotes,
    },
  }
}

type RobotsRule = { userAgent: string; allow: string[]; disallow: string[] }

export function generateRobotsTxt(options: Record<string, unknown>): SeoToolResponse {
  const rulesRaw = options.rules
  const sitemapUrl = str(options.sitemapUrl)

  if (!Array.isArray(rulesRaw) || rulesRaw.length === 0) {
    return { error: 'Add at least one user-agent rule.' }
  }

  const rules = rulesRaw as RobotsRule[]
  const lines: string[] = []

  for (const rule of rules) {
    const ua = str(rule.userAgent) || '*'
    lines.push(`User-agent: ${ua}`)
    for (const path of rule.allow ?? []) {
      const p = str(path)
      if (p) lines.push(`Allow: ${p}`)
    }
    for (const path of rule.disallow ?? []) {
      const p = str(path)
      if (p) lines.push(`Disallow: ${p}`)
    }
    lines.push('')
  }

  if (sitemapUrl) {
    if (!isValidHttpUrl(sitemapUrl)) {
      return { error: 'Sitemap URL must be a valid http or https URL.' }
    }
    lines.push(`Sitemap: ${sitemapUrl}`)
  }

  return { output: lines.join('\n').trim() + '\n' }
}

export function buildOgPreview(options: Record<string, unknown>): SeoToolResponse {
  const title = str(options.title) || 'Page Title'
  const description = str(options.description) || 'Page description appears here when shared on social networks.'
  const image = str(options.image)
  const url = str(options.url) || 'https://example.com/page'
  const siteName =
    str(options.siteName) || (isValidHttpUrl(url) ? new URL(url).hostname : 'example.com')

  if (url && !isValidHttpUrl(url)) {
    return { error: 'Page URL must be a valid http or https URL.' }
  }
  if (image && !isValidHttpUrl(image)) {
    return { error: 'Image URL must be a valid http or https URL.' }
  }

  return {
    meta: {
      title,
      description,
      image,
      url,
      siteName,
    },
  }
}

export function generateSchemaMarkup(options: Record<string, unknown>): SeoToolResponse {
  const schemaType = str(options.schemaType) as SchemaType
  const fields = (options.fields as Record<string, unknown>) ?? {}

  const validTypes: SchemaType[] = [
    'Article', 'BlogPosting', 'Organization', 'WebSite', 'LocalBusiness',
    'FAQPage', 'Product', 'BreadcrumbList', 'Person', 'Event',
  ]

  if (!validTypes.includes(schemaType)) {
    return { error: 'Select a valid schema type.' }
  }

  let schema: Record<string, unknown>

  switch (schemaType) {
    case 'Article':
    case 'BlogPosting': {
      const headline = str(fields.headline)
      const author = str(fields.author)
      const datePublished = str(fields.datePublished)
      const image = str(fields.image)
      const url = str(fields.url)
      if (!headline) return { error: 'Headline is required for Article/Blog Post schema.' }
      schema = {
        '@context': 'https://schema.org',
        '@type': schemaType,
        headline,
        ...(author && { author: { '@type': 'Person', name: author } }),
        ...(datePublished && { datePublished }),
        ...(image && { image }),
        ...(url && { url }),
      }
      break
    }
    case 'Organization': {
      const name = str(fields.name)
      const url = str(fields.url)
      const logo = str(fields.logo)
      if (!name) return { error: 'Organization name is required.' }
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name,
        ...(url && { url }),
        ...(logo && { logo }),
      }
      break
    }
    case 'WebSite': {
      const name = str(fields.name)
      const url = str(fields.url)
      if (!name || !url) return { error: 'Website name and URL are required.' }
      if (!isValidHttpUrl(url)) return { error: 'Website URL must be valid.' }
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name,
        url,
      }
      break
    }
    case 'LocalBusiness': {
      const name = str(fields.name)
      const address = str(fields.address)
      const telephone = str(fields.telephone)
      if (!name) return { error: 'Business name is required.' }
      schema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name,
        ...(address && { address: { '@type': 'PostalAddress', streetAddress: address } }),
        ...(telephone && { telephone }),
      }
      break
    }
    case 'FAQPage': {
      const faqText = str(fields.faqs)
      const pairs = faqText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const idx = line.indexOf('|')
          if (idx === -1) return null
          return { q: line.slice(0, idx).trim(), a: line.slice(idx + 1).trim() }
        })
        .filter((p): p is { q: string; a: string } => p !== null && Boolean(p.q) && Boolean(p.a))

      if (pairs.length === 0) {
        return { error: 'Add FAQ entries as "Question | Answer" (one per line).' }
      }

      schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: pairs.map((pair) => ({
          '@type': 'Question',
          name: pair.q,
          acceptedAnswer: { '@type': 'Answer', text: pair.a },
        })),
      }
      break
    }
    case 'Product': {
      const name = str(fields.name)
      const description = str(fields.description)
      const price = str(fields.price)
      const image = str(fields.image)
      if (!name) return { error: 'Product name is required.' }
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        ...(description && { description }),
        ...(image && { image }),
        ...(price && {
          offers: { '@type': 'Offer', price, priceCurrency: str(fields.currency) || 'USD' },
        }),
      }
      break
    }
    case 'BreadcrumbList': {
      const itemsText = str(fields.items)
      const items = itemsText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          const parts = line.split('|').map((p) => p.trim())
          return {
            '@type': 'ListItem',
            position: index + 1,
            name: parts[0] ?? '',
            ...(parts[1] && isValidHttpUrl(parts[1]) ? { item: parts[1] } : {}),
          }
        })
        .filter((item) => item.name)

      if (items.length === 0) {
        return { error: 'Add breadcrumb items as "Name | URL" (one per line).' }
      }

      schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items,
      }
      break
    }
    case 'Person': {
      const name = str(fields.name)
      const jobTitle = str(fields.jobTitle)
      const url = str(fields.url)
      if (!name) return { error: 'Person name is required.' }
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name,
        ...(jobTitle && { jobTitle }),
        ...(url && { url }),
      }
      break
    }
    case 'Event': {
      const name = str(fields.name)
      const startDate = str(fields.startDate)
      const location = str(fields.location)
      if (!name || !startDate) return { error: 'Event name and start date are required.' }
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name,
        startDate,
        ...(location && { location: { '@type': 'Place', name: location } }),
      }
      break
    }
    default:
      return { error: 'Unsupported schema type.' }
  }

  let output: string
  try {
    output = JSON.stringify(schema, null, 2)
    JSON.parse(output)
  } catch {
    return { error: 'Failed to generate valid JSON-LD.' }
  }

  const wrapped = `<script type="application/ld+json">\n${output}\n</script>`

  return {
    output: wrapped,
    meta: { jsonLd: output, schemaType, valid: true },
  }
}

export function analyzeKeywordDensity(text: string, options: Record<string, unknown>): SeoToolResponse {
  const input = text.trim()
  if (!input) return { error: 'Enter text to analyze.' }

  const minLength = num(options.minWordLength, 3)
  const topN = num(options.topN, 50)
  const ignoreStopWords = options.ignoreStopWords !== false

  const words = input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= minLength)
    .filter((w) => !ignoreStopWords || !STOP_WORDS.has(w))

  const totalWords = words.length
  if (totalWords === 0) {
    return { error: 'No analyzable words found after filtering.' }
  }

  const freq = new Map<string, number>()
  for (const word of words) {
    freq.set(word, (freq.get(word) ?? 0) + 1)
  }

  const rows: KeywordDensityRow[] = [...freq.entries()]
    .map(([keyword, count]) => ({
      keyword,
      count,
      density: (count / totalWords) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN)

  const lines = [
    `Total words analyzed: ${totalWords}`,
    '',
    'Keyword\tCount\tDensity %',
    ...rows.map((r) => `${r.keyword}\t${r.count}\t${r.density.toFixed(2)}%`),
  ]

  return {
    output: lines.join('\n'),
    meta: { totalWords, rows },
  }
}

export function generateSlug(text: string, options: Record<string, unknown>): SeoToolResponse {
  const input = text.trim()
  if (!input) return { error: 'Enter text to convert into a URL slug.' }

  const separator = str(options.separator) === '_' ? '_' : '-'
  const maxLength = num(options.maxLength, 80)

  let slug = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/[\s_]+/g, separator)
    .replace(new RegExp(`${separator}+`, 'g'), separator)
    .replace(new RegExp(`^${separator}|${separator}$`, 'g'), '')

  if (maxLength > 0 && slug.length > maxLength) {
    slug = slug.slice(0, maxLength).replace(new RegExp(`${separator}[^${separator}]*$`), '')
  }

  if (!slug) return { error: 'Could not generate a slug from the provided text.' }

  return { output: slug }
}

export function analyzeHeadings(text: string): SeoToolResponse {
  const input = text.trim()
  if (!input) return { error: 'Paste HTML or heading markup to analyze.' }

  const headings: HeadingEntry[] = []
  const regex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi
  let match: RegExpExecArray | null

  while ((match = regex.exec(input)) !== null) {
    const level = Number(match[1])
    const rawText = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    headings.push({ level, tag: `H${level}`, text: rawText })
  }

  if (headings.length === 0) {
    const mdRegex = /^(#{1,6})\s+(.+)$/gm
    let mdMatch: RegExpExecArray | null
    while ((mdMatch = mdRegex.exec(input)) !== null) {
      const level = mdMatch[1].length
      headings.push({ level, tag: `H${level}`, text: mdMatch[2].trim() })
    }
  }

  if (headings.length === 0) {
    return { error: 'No H1–H6 headings found. Paste HTML or Markdown headings.' }
  }

  const issues: HeadingIssue[] = []
  const h1s = headings.filter((h) => h.level === 1)

  if (h1s.length === 0) {
    issues.push({ type: 'missing-h1', message: 'No H1 found. Every page should have exactly one H1.', severity: 'error' })
  } else if (h1s.length > 1) {
    issues.push({
      type: 'duplicate-h1',
      message: `Found ${h1s.length} H1 tags. Use only one H1 per page.`,
      severity: 'error',
    })
  }

  for (const h of headings) {
    if (!h.text) {
      issues.push({ type: 'empty-heading', message: `Empty ${h.tag} detected.`, severity: 'warning' })
    }
  }

  let prevLevel = 0
  for (const h of headings) {
    if (prevLevel > 0 && h.level > prevLevel + 1) {
      issues.push({
        type: 'skipped-level',
        message: `Heading hierarchy skips from H${prevLevel} to H${h.level} ("${h.text.slice(0, 40)}").`,
        severity: 'warning',
      })
    }
    prevLevel = h.level
  }

  const recommendations: string[] = []
  if (h1s.length === 1) recommendations.push('✓ Single H1 present — good for SEO.')
  if (issues.some((i) => i.type === 'skipped-level')) {
    recommendations.push('Fix heading hierarchy: do not skip levels (e.g. H2 → H4).')
  }
  if (headings.filter((h) => h.level === 2).length === 0 && headings.length > 1) {
    recommendations.push('Consider adding H2 subheadings to structure content.')
  }

  const report = [
    'HEADING STRUCTURE',
    ...headings.map((h) => `${h.tag}: ${h.text || '(empty)'}`),
    '',
    'ISSUES',
    ...(issues.length ? issues.map((i) => `[${i.severity.toUpperCase()}] ${i.message}`) : ['None detected']),
    '',
    'RECOMMENDATIONS',
    ...(recommendations.length ? recommendations : ['Heading structure looks good.']),
  ]

  return {
    output: report.join('\n'),
    meta: { headings, issues, recommendations },
  }
}

export function checkCanonical(options: Record<string, unknown>): SeoToolResponse {
  const pageUrl = str(options.pageUrl)
  const canonicalUrl = str(options.canonicalUrl)

  if (!pageUrl) return { error: 'Enter the page URL.' }
  if (!canonicalUrl) return { error: 'Enter the canonical URL.' }

  const issues: string[] = []
  const recommendations: string[] = []

  if (!isValidHttpUrl(pageUrl)) issues.push('Page URL format is invalid.')
  if (!isValidHttpUrl(canonicalUrl)) issues.push('Canonical URL format is invalid.')

  if (issues.length > 0) {
    return { error: issues.join(' ') }
  }

  const normalizedPage = pageUrl.replace(/\/$/, '')
  const normalizedCanonical = canonicalUrl.replace(/\/$/, '')
  const isSelfReferencing = normalizedPage === normalizedCanonical

  if (isSelfReferencing) {
    recommendations.push('Canonical URL is self-referencing — correct for the primary version of this page.')
  } else {
    recommendations.push('Canonical points to a different URL — use this only when consolidating duplicate content.')
    const pageHost = getHostname(pageUrl)
    const canonHost = getHostname(canonicalUrl)
    if (pageHost && canonHost && pageHost !== canonHost) {
      recommendations.push('Cross-domain canonical detected — ensure this is intentional.')
    }
  }

  if (canonicalUrl !== canonicalUrl.toLowerCase()) {
    recommendations.push('Prefer lowercase URLs in canonical tags for consistency.')
  }

  const tag = `<link rel="canonical" href="${escapeAttr(canonicalUrl)}">`

  const report = [
    `Page URL: ${pageUrl}`,
    `Canonical URL: ${canonicalUrl}`,
    `Self-referencing: ${isSelfReferencing ? 'Yes' : 'No'}`,
    '',
    'Generated canonical tag:',
    tag,
    '',
    'Recommendations:',
    ...recommendations.map((r) => `• ${r}`),
  ]

  return {
    output: report.join('\n'),
    meta: { isSelfReferencing, canonicalTag: tag, recommendations },
  }
}

export function generatePageSpeedTips(options: Record<string, unknown>): SeoToolResponse {
  const pageUrl = str(options.pageUrl)
  const imageCount = num(options.imageCount, 0)
  const cssFiles = num(options.cssFiles, 0)
  const jsFiles = num(options.jsFiles, 0)
  const pageSizeKb = num(options.pageSizeKb, 0)
  const hasLazyLoad = bool(options.hasLazyLoad)
  const hasCaching = bool(options.hasCaching)
  const mobileOptimized = bool(options.mobileOptimized)
  const usesCdn = bool(options.usesCdn)
  const usesMinification = bool(options.usesMinification)

  if (pageUrl && !isValidHttpUrl(pageUrl)) {
    return { error: 'Page URL must be a valid http or https URL (or leave blank).' }
  }

  const tips: string[] = []

  tips.push('PAGE SPEED OPTIMIZATION RECOMMENDATIONS')
  tips.push('(Based on your inputs — not a live Lighthouse audit)')
  if (pageUrl) tips.push(`Page: ${pageUrl}`)
  tips.push('')

  if (imageCount > 10 || !hasLazyLoad) {
    tips.push('Images:')
    if (imageCount > 10) tips.push(`  • You have ~${imageCount} images — compress with WebP/AVIF and serve responsive sizes.`)
    if (!hasLazyLoad) tips.push('  • Enable lazy loading for below-the-fold images (loading="lazy").')
    if (imageCount > 0) tips.push('  • Add explicit width/height to prevent layout shift (CLS).')
    tips.push('')
  }

  if (cssFiles > 3 || !usesMinification) {
    tips.push('CSS:')
    if (cssFiles > 3) tips.push(`  • ${cssFiles} CSS files detected — combine and purge unused CSS.`)
    if (!usesMinification) tips.push('  • Minify CSS and inline critical above-the-fold styles.')
    tips.push('  • Avoid @import chains; use link tags for parallel loading.')
    tips.push('')
  }

  if (jsFiles > 5 || !usesMinification) {
    tips.push('JavaScript:')
    if (jsFiles > 5) tips.push(`  • ${jsFiles} JS files — bundle, defer non-critical scripts, and tree-shake.`)
    if (!usesMinification) tips.push('  • Minify JavaScript and enable code splitting.')
    tips.push('  • Use async/defer attributes to avoid render-blocking.')
    tips.push('')
  }

  if (!hasCaching) {
    tips.push('Caching:')
    tips.push('  • Set Cache-Control headers for static assets (1 year for hashed files).')
    tips.push('  • Enable browser caching and consider a CDN edge cache.')
    tips.push('')
  } else if (!usesCdn) {
    tips.push('Caching:')
    tips.push('  • Caching is enabled — consider a CDN to reduce latency globally.')
    tips.push('')
  }

  if (pageSizeKb > 1500) {
    tips.push('Page weight:')
    tips.push(`  • Page size ~${pageSizeKb} KB is heavy — aim for under 1.5 MB total.`)
    tips.push('')
  }

  tips.push('Core Web Vitals:')
  if (!mobileOptimized) tips.push('  • LCP: Optimize largest image/font; preload hero image.')
  tips.push('  • INP: Reduce main-thread work; break up long JavaScript tasks.')
  tips.push('  • CLS: Reserve space for ads, embeds, and dynamic content.')
  if (!mobileOptimized) tips.push('  • Enable mobile viewport meta and test on real devices.')
  tips.push('')

  if (imageCount <= 5 && cssFiles <= 2 && jsFiles <= 3 && hasLazyLoad && hasCaching && usesMinification) {
    tips.push('Your inputs suggest a well-optimized page. Run Google PageSpeed Insights for live metrics.')
  } else {
    tips.push('Run Google PageSpeed Insights or WebPageTest for measured scores after applying these changes.')
  }

  return { output: tips.join('\n'), meta: { tipCount: tips.length } }
}

export function analyzeBacklinks(options: Record<string, unknown>): SeoToolResponse {
  const targetDomain = normalizeDomain(str(options.targetDomain))
  const urlsText = str(options.backlinkUrls)
  const snippetsRaw = options.snippets as Record<string, string> | undefined

  if (!targetDomain) return { error: 'Enter your target domain (e.g. example.com).' }
  if (!urlsText) return { error: 'Enter at least one potential backlink URL (one per line).' }

  const urls = urlsText.split(/\r?\n/).map((u) => u.trim()).filter(Boolean)
  const rows: BacklinkRow[] = []

  for (const url of urls) {
    const notes: string[] = []
    const valid = isValidHttpUrl(url)
    if (!valid) {
      rows.push({ url, valid: false, isExternal: false, mentionsTarget: false, notes: ['Invalid URL format'] })
      continue
    }

    const host = getHostname(url)
    const isExternal = host !== null && host !== targetDomain
    const snippet = snippetsRaw?.[url] ?? ''
    const mentionsTarget =
      snippet.toLowerCase().includes(targetDomain) ||
      snippet.toLowerCase().includes(`https://${targetDomain}`) ||
      snippet.toLowerCase().includes(`http://${targetDomain}`)

    if (isExternal) notes.push('External domain — potential backlink source')
    else notes.push('Same domain — internal link, not a backlink')

    if (snippet) {
      if (mentionsTarget) notes.push('Snippet mentions target domain')
      else notes.push('Snippet does not mention target domain')
    } else {
      notes.push('No snippet provided — cannot verify anchor context')
    }

    notes.push('Demo mode: verify live backlinks with Google Search Console or Ahrefs/Moz')

    rows.push({ url, valid, isExternal, mentionsTarget, notes })
  }

  const externalCount = rows.filter((r) => r.valid && r.isExternal).length
  const verifiedMentions = rows.filter((r) => r.mentionsTarget).length

  const report = [
    'BACKLINK ANALYZER (DEMO MODE)',
    'This tool validates URLs and checks your snippets — it does not crawl the web or fetch live backlink data.',
    '',
    `Target domain: ${targetDomain}`,
    `URLs analyzed: ${rows.length}`,
    `Valid external URLs: ${externalCount}`,
    `Snippets mentioning target: ${verifiedMentions}`,
    '',
    'RESULTS',
    ...rows.map((r) => {
      const status = [
        r.valid ? 'Valid' : 'Invalid',
        r.isExternal ? 'External' : 'Internal',
        r.mentionsTarget ? 'Mentions target' : 'No mention in snippet',
      ].join(' | ')
      return `${r.url}\n  ${status}\n  ${r.notes.map((n) => `  • ${n}`).join('\n')}`
    }),
  ]

  return {
    output: report.join('\n'),
    meta: {
      demoMode: true,
      targetDomain,
      rows,
      externalCount,
      verifiedMentions,
    },
  }
}

export function processSeoTool(slug: SeoToolSlug, request: SeoToolRequest): SeoToolResponse {
  const text = request.text ?? ''
  const options = request.options ?? {}

  switch (slug) {
    case 'meta-tag-generator':
      return generateMetaTags(options)
    case 'sitemap-generator':
      return generateSitemap(text, options)
    case 'robots-txt':
      return generateRobotsTxt(options)
    case 'open-graph-preview':
      return buildOgPreview(options)
    case 'schema-markup':
      return generateSchemaMarkup(options)
    case 'keyword-density':
      return analyzeKeywordDensity(text, options)
    case 'slug-generator':
      return generateSlug(text, options)
    case 'heading-analyzer':
      return analyzeHeadings(text)
    case 'canonical-checker':
      return checkCanonical(options)
    case 'page-speed-tips':
      return generatePageSpeedTips(options)
    case 'backlink-checker':
      return analyzeBacklinks(options)
    default:
      return { error: 'Unknown SEO tool.' }
  }
}
