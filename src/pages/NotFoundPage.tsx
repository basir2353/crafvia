import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import './CompressImage.css'

export function NotFoundPage() {
  return (
    <div className="app tool-page">
      <Header />
      <main className="tool-main">
        <div className="tool-container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={14} aria-hidden />
            <span className="breadcrumb-current">Page not found</span>
          </nav>
          <header className="tool-header">
            <h1 className="tool-title">Page not found</h1>
            <p className="tool-lead">
              This page does not exist. Browse categories on the home page or pick a tool from the menu.
            </p>
          </header>
          <div className="upload-outer">
            <Link to="/" className="tool-compress-btn" style={{ display: 'inline-flex', textDecoration: 'none' }}>
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
