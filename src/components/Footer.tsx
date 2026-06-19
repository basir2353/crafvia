import { Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { openDonatePage } from '../api/config'

const footerLinks = {
  Tools: [
    'Image Tools',
    'PDF Tools',
    'Video Tools',
    'Audio Tools',
    'AI Writing',
    'All Tools',
  ],
  'More Tools': [
    'Developer Tools',
    'SEO Tools',
    'Text Tools',
    'Calculators',
    'AI Generation',
    'Converters',
    'Compressors',
    'Utilities',
    'Security Tools',
  ],
  Company: ['Pricing', 'Blog', 'FAQ', 'About', 'Changelog', 'Donate'],
  Legal: ['Privacy Policy', 'Terms of Service'],
}

const categoryHrefMap: Record<string, string> = {
  'Image Tools': '/categories/image-tools',
  'PDF Tools': '/categories/pdf-tools',
  'Video Tools': '/categories/video-tools',
  'Audio Tools': '/categories/audio-tools',
  'AI Writing': '/categories/ai-writing',
  'All Tools': '/',
  'Developer Tools': '/categories/developer-tools',
  'SEO Tools': '/categories/seo-tools',
  'Text Tools': '/categories/text-tools',
  Calculators: '/categories/calculators',
  'AI Generation': '/categories/ai-generation',
  Converters: '/categories/converters',
  Compressors: '/categories/compressors',
  Utilities: '/categories/utilities',
  'Security Tools': '/categories/security-tools',
}

const contentHrefMap: Record<string, string> = {
  Pricing: '/pricing',
  Blog: '/blog',
  FAQ: '/faq',
  About: '/about',
  Changelog: '/changelog',
  'Privacy Policy': '/privacy',
  'Terms of Service': '/terms',
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="logo-craf">Craf</span>
            <span className="logo-via">via</span>
          </Link>
          <p className="footer-desc">
            180+ free tools that run entirely in your browser. No uploads, no
            signups, no limits.
          </p>
          <span className="footer-badge">
            <Shield size={14} aria-hidden />
            100% Browser-Based
          </span>
        </div>

        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading} className="footer-col">
            <h3 className="footer-col-title">{heading}</h3>
            <ul>
              {links.map((link) => {
                const categoryHref = categoryHrefMap[link]
                if (categoryHref) {
                  return (
                    <li key={link}>
                      <Link to={categoryHref}>{link}</Link>
                    </li>
                  )
                }

                const contentHref = contentHrefMap[link]
                if (contentHref) {
                  return (
                    <li key={link}>
                      <Link to={contentHref}>{link}</Link>
                    </li>
                  )
                }

                if (link === 'Donate') {
                  return (
                    <li key={link}>
                      <button
                        type="button"
                        className="footer-link-btn"
                        onClick={() => void openDonatePage().catch(() => {})}
                      >
                        {link}
                      </button>
                    </li>
                  )
                }

                return (
                  <li key={link}>
                    <span>{link}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Crafvia. All rights reserved.</p>
      </div>
    </footer>
  )
}
