import { Globe, Shield, Zap } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Zero Uploads',
    description:
      'All processing happens inside your browser tab. Your files never touch our servers.',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description:
      'No waiting for uploads or downloads. Get results in seconds, right where you are.',
  },
  {
    icon: Globe,
    title: 'Works Offline',
    description:
      'Many tools work without an internet connection once the page has loaded.',
  },
]

export function PrivacyFeatures() {
  return (
    <section className="privacy-section">
      <div className="privacy-inner">
        <h2 className="privacy-title">Your files never leave your browser</h2>
        <p className="privacy-subtitle">
          Unlike other tools, Crafvia processes everything locally in your browser.
          Complete privacy, instant speed.
        </p>
        <ul className="privacy-grid">
          {features.map(({ icon: Icon, title, description }) => (
            <li key={title} className="privacy-item">
              <span className="privacy-icon-wrap">
                <Icon size={22} strokeWidth={2} aria-hidden />
              </span>
              <h3 className="privacy-item-title">{title}</h3>
              <p className="privacy-item-desc">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
