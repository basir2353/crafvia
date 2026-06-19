import { Download, FolderOpen, Search } from 'lucide-react'

const steps = [
  {
    icon: Search,
    title: 'Choose a tool',
    description: 'Search or browse 180+ tools for any task',
  },
  {
    icon: FolderOpen,
    title: 'Upload or paste',
    description: 'Drop your file or type your content',
  },
  {
    icon: Download,
    title: 'Download instantly',
    description: 'Get your result in seconds, completely free',
  },
]

export function HowItWorks() {
  return (
    <section className="how-it-works">
      <ul className="steps-grid">
        {steps.map(({ icon: Icon, title, description }) => (
          <li key={title} className="step-item">
            <span className="step-icon-wrap">
              <Icon size={24} strokeWidth={2} aria-hidden />
            </span>
            <h3 className="step-title">{title}</h3>
            <p className="step-desc">{description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
