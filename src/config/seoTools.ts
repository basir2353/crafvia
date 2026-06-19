import { Globe, Link2, Search, Tag } from 'lucide-react'
import type { RelatedTool } from './tools'

export type SeoToolConfig = {
  path: string
  category: string
  breadcrumb: string
  title: string
  lead: string
  actionLabel?: string
  whatIsTitle: string
  whatIsBody: string
  howToTitle: string
  howToSteps: string[]
  faqs: { question: string; answer: string }[]
  popularTitle: string
  popularOptions: { label: string; href?: string }[]
  relatedTools: RelatedTool[]
}

const seoRelated: RelatedTool[] = [
  { name: 'Meta Tag Generator', description: 'Generate SEO meta tags', icon: Tag, href: '/tools/meta-tag-generator' },
  { name: 'Sitemap Generator', description: 'Create XML sitemaps', icon: Globe, href: '/tools/sitemap-generator' },
  { name: 'Schema Markup', description: 'JSON-LD structured data', icon: Search, href: '/tools/schema-markup' },
  { name: 'Canonical Checker', description: 'Validate canonical URLs', icon: Link2, href: '/tools/canonical-checker' },
  { name: 'Keyword Density', description: 'Analyze keyword usage', icon: Search, href: '/tools/keyword-density' },
  { name: 'URL Slug Generator', description: 'SEO-friendly slugs', icon: Link2, href: '/tools/slug-generator' },
]

const baseFaq = [
  {
    question: 'Is my data uploaded to a server?',
    answer:
      'SEO tools run primarily in your browser for instant, private processing. An optional server API mirrors the same operations.',
  },
  {
    question: 'Are the results production-ready?',
    answer:
      'Generated meta tags, sitemaps, robots.txt, and JSON-LD follow standard formats. Always review before deploying to production.',
  },
  {
    question: 'Can I copy or download results?',
    answer: 'Yes. Copy output to your clipboard or download files such as sitemap.xml, robots.txt, or JSON-LD.',
  },
]

function cfg(
  partial: Omit<SeoToolConfig, 'category' | 'popularTitle' | 'faqs' | 'relatedTools' | 'popularOptions'> & {
    faqs?: SeoToolConfig['faqs']
    relatedTools?: RelatedTool[]
    popularOptions?: SeoToolConfig['popularOptions']
  },
): SeoToolConfig {
  return {
    category: 'SEO Tools',
    popularTitle: `Popular ${partial.breadcrumb} Options`,
    popularOptions: partial.popularOptions ?? [
      { label: `${partial.breadcrumb} Online Free`, href: partial.path },
    ],
    faqs: partial.faqs ?? baseFaq,
    relatedTools: partial.relatedTools ?? seoRelated,
    ...partial,
  }
}

export const metaTagGeneratorConfig = cfg({
  path: '/tools/meta-tag-generator',
  breadcrumb: 'Meta Tag Generator',
  title: 'Meta Tag Generator - Free SEO Tags',
  lead: 'Generate title, description, canonical, Open Graph, and Twitter Card meta tags with live preview.',
  whatIsTitle: 'What is Meta Tag Generator?',
  whatIsBody:
    'Meta Tag Generator creates complete HTML head tags for SEO and social sharing — title, description, canonical, Open Graph, and Twitter Cards.',
  howToTitle: 'How to use Meta Tag Generator',
  howToSteps: [
    'Enter your page title and meta description.',
    'Add canonical, Open Graph, and Twitter Card details.',
    'Preview how tags appear in search and social shares.',
    'Copy or download the generated HTML.',
  ],
})

export const sitemapGeneratorConfig = cfg({
  path: '/tools/sitemap-generator',
  breadcrumb: 'Sitemap Generator',
  title: 'Sitemap Generator - XML Sitemap',
  lead: 'Create valid XML sitemaps from one or many URLs with validation and download.',
  whatIsTitle: 'What is Sitemap Generator?',
  whatIsBody:
    'Sitemap Generator builds standards-compliant XML sitemaps to help search engines discover your pages.',
  howToTitle: 'How to use Sitemap Generator',
  howToSteps: [
    'Paste URLs one per line.',
    'Set change frequency, priority, and last modified date.',
    'Generate and validate the XML sitemap.',
    'Download sitemap.xml for your site.',
  ],
})

export const robotsTxtConfig = cfg({
  path: '/tools/robots-txt',
  breadcrumb: 'Robots.txt Generator',
  title: 'Robots.txt Generator - Free',
  lead: 'Generate robots.txt with Allow, Disallow rules, multiple user agents, and sitemap URL.',
  whatIsTitle: 'What is Robots.txt Generator?',
  whatIsBody:
    'Robots.txt Generator creates crawler instruction files that tell search engines which paths to crawl or ignore.',
  howToTitle: 'How to use Robots.txt Generator',
  howToSteps: [
    'Configure user-agent rules with Allow and Disallow paths.',
    'Add additional user agents as needed.',
    'Include your sitemap URL.',
    'Download robots.txt for your site root.',
  ],
})

export const openGraphPreviewConfig = cfg({
  path: '/tools/open-graph-preview',
  breadcrumb: 'Open Graph Preview',
  title: 'Open Graph Preview - Social Cards',
  lead: 'Preview how your page appears when shared on Facebook, LinkedIn, and X (Twitter).',
  whatIsTitle: 'What is Open Graph Preview?',
  whatIsBody:
    'Open Graph Preview shows real-time social sharing card previews for title, description, image, and URL.',
  howToTitle: 'How to use Open Graph Preview',
  howToSteps: [
    'Enter your page title and description.',
    'Add an image URL and page URL.',
    'See Facebook, LinkedIn, and X-style previews update live.',
    'Use Meta Tag Generator to export the matching tags.',
  ],
})

export const schemaMarkupConfig = cfg({
  path: '/tools/schema-markup',
  breadcrumb: 'Schema Markup',
  title: 'Schema Markup - JSON-LD Generator',
  lead: 'Generate valid JSON-LD structured data for Article, Product, FAQ, and more.',
  whatIsTitle: 'What is Schema Markup?',
  whatIsBody:
    'Schema Markup generates JSON-LD structured data that helps search engines understand your content.',
  howToTitle: 'How to use Schema Markup',
  howToSteps: [
    'Select a schema type (Article, Product, FAQ, etc.).',
    'Fill in the required fields.',
    'Generate and validate JSON-LD output.',
    'Copy or download the script tag.',
  ],
})

export const keywordDensityConfig = cfg({
  path: '/tools/keyword-density',
  breadcrumb: 'Keyword Density',
  title: 'Keyword Density Analyzer',
  lead: 'Analyze keyword frequency and density with stop-word filtering and export.',
  whatIsTitle: 'What is Keyword Density?',
  whatIsBody:
    'Keyword Density measures how often words appear in your text — useful for SEO content optimization.',
  howToTitle: 'How to use Keyword Density',
  howToSteps: [
    'Paste your page content or article text.',
    'Analyze keyword frequency and density percentages.',
    'Review repeated keywords (stop words filtered).',
    'Export results as text.',
  ],
})

export const slugGeneratorConfig = cfg({
  path: '/tools/slug-generator',
  breadcrumb: 'URL Slug Generator',
  title: 'URL Slug Generator - SEO Friendly',
  lead: 'Create clean, lowercase, Unicode-safe URL slugs from any text.',
  whatIsTitle: 'What is URL Slug Generator?',
  whatIsBody:
    'URL Slug Generator converts titles into SEO-friendly URL paths by removing special characters and normalizing spaces.',
  howToTitle: 'How to use URL Slug Generator',
  howToSteps: [
    'Enter your page title or phrase.',
    'Generate the SEO-friendly slug.',
    'Copy the result into your CMS or URL structure.',
  ],
})

export const headingAnalyzerConfig = cfg({
  path: '/tools/heading-analyzer',
  breadcrumb: 'Heading Analyzer',
  title: 'Heading Analyzer - H1 to H6',
  lead: 'Analyze heading structure, detect missing H1, duplicates, and hierarchy issues.',
  whatIsTitle: 'What is Heading Analyzer?',
  whatIsBody:
    'Heading Analyzer inspects H1–H6 structure in HTML or Markdown and provides SEO recommendations.',
  howToTitle: 'How to use Heading Analyzer',
  howToSteps: [
    'Paste HTML or Markdown with headings.',
    'Analyze the heading hierarchy.',
    'Review issues and SEO recommendations.',
    'Copy the analysis report.',
  ],
})

export const canonicalCheckerConfig = cfg({
  path: '/tools/canonical-checker',
  breadcrumb: 'Canonical Checker',
  title: 'Canonical Checker - URL Validator',
  lead: 'Validate canonical URLs, detect self-referencing tags, and get SEO recommendations.',
  whatIsTitle: 'What is Canonical Checker?',
  whatIsBody:
    'Canonical Checker validates canonical URL format and helps prevent duplicate content issues.',
  howToTitle: 'How to use Canonical Checker',
  howToSteps: [
    'Enter your page URL and canonical URL.',
    'Check for self-referencing and format issues.',
    'Copy the generated canonical link tag.',
    'Apply recommendations to your site.',
  ],
})

export const pageSpeedTipsConfig = cfg({
  path: '/tools/page-speed-tips',
  breadcrumb: 'Page Speed Tips',
  title: 'Page Speed Tips - Optimization',
  lead: 'Get personalized performance recommendations for images, CSS, JS, caching, and Core Web Vitals.',
  whatIsTitle: 'What is Page Speed Tips?',
  whatIsBody:
    'Page Speed Tips generates actionable optimization advice based on your page characteristics — not fake Lighthouse scores.',
  howToTitle: 'How to use Page Speed Tips',
  howToSteps: [
    'Describe your page (images, CSS/JS files, caching, etc.).',
    'Generate optimization recommendations.',
    'Apply image, CSS, JS, and caching improvements.',
    'Verify with Google PageSpeed Insights.',
  ],
})

export const backlinkCheckerConfig = cfg({
  path: '/tools/backlink-checker',
  breadcrumb: 'Backlink Checker',
  title: 'Backlink Checker - URL Analyzer',
  lead: 'Validate potential backlink URLs and snippets in demo mode — no fake crawl data.',
  whatIsTitle: 'What is Backlink Checker?',
  whatIsBody:
    'Backlink Checker runs in demo/analyzer mode: it validates URLs you provide and checks snippets for target domain mentions. It does not crawl the web.',
  howToTitle: 'How to use Backlink Checker',
  howToSteps: [
    'Enter your target domain.',
    'Paste potential backlink URLs (one per line).',
    'Optionally add snippets to check for target mentions.',
    'Review validation results and verify live data in Search Console.',
  ],
})
