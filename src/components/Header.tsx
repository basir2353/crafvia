import { Coffee, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { openDonatePage } from '../api/config'
import { useAuth } from '../context/AuthContext'
import { AuthDialog } from './AuthDialog'
import { HeaderNav } from './HeaderNav'
import { SearchOverlay } from './SearchOverlay'

type Toast = {
  type: 'success' | 'error'
  message: string
}

export function Header() {
  const { user, signOut, goPro } = useAuth()
  const location = useLocation()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [authSubtitle, setAuthSubtitle] = useState<string | undefined>()
  const [pendingProUpgrade, setPendingProUpgrade] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [donateLoading, setDonateLoading] = useState(false)
  const [proLoading, setProLoading] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 4500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message })
  }

  const openSignIn = () => {
    setPendingProUpgrade(false)
    setAuthSubtitle(undefined)
    setAuthMode('signin')
    setAuthOpen(true)
  }

  const completeProUpgrade = async () => {
    setProLoading(true)
    try {
      const result = await goPro()
      if (result.checkoutUrl) {
        showToast('success', 'Checkout opened in a new tab.')
        return
      }
      if (result.plan === 'PRO') {
        showToast('success', 'Welcome to Pro! Your account has been upgraded.')
      }
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Upgrade failed. Please try again.',
      )
    } finally {
      setProLoading(false)
    }
  }

  const handleGetPro = async () => {
    if (!user) {
      setPendingProUpgrade(true)
      setAuthSubtitle('Sign in to upgrade to Pro.')
      setAuthMode('signin')
      setAuthOpen(true)
      return
    }
    await completeProUpgrade()
  }

  const handleAuthSuccess = async () => {
    if (pendingProUpgrade) {
      setPendingProUpgrade(false)
      setAuthSubtitle(undefined)
      await completeProUpgrade()
    }
  }

  const handleDonate = async () => {
    setDonateLoading(true)
    try {
      await openDonatePage()
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Could not open donate page. Please try again.',
      )
    } finally {
      setDonateLoading(false)
    }
  }

  const handleSearchClick = () => {
    if (location.pathname === '/') {
      const input = document.querySelector<HTMLInputElement>('.hero .search-input')
      if (input) {
        input.focus()
        input.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
      }
    }
    setSearchOpen(true)
  }

  const closeAuthDialog = () => {
    setAuthOpen(false)
    setPendingProUpgrade(false)
    setAuthSubtitle(undefined)
  }

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">
            <span className="logo-craf">Craf</span>
            <span className="logo-via">via</span>
          </Link>

          <HeaderNav />

          <div className="header-actions">
            <button
              type="button"
              className="action-link donate"
              onClick={() => void handleDonate()}
              disabled={donateLoading}
              aria-busy={donateLoading}
            >
              <Coffee size={16} strokeWidth={2} aria-hidden />
              <span>{donateLoading ? 'Opening…' : 'Donate'}</span>
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Search"
              onClick={handleSearchClick}
            >
              <Search size={20} strokeWidth={2} />
            </button>
            {user ? (
              <>
                <button type="button" className="action-link sign-in" onClick={() => void signOut()}>
                  Sign Out
                </button>
                {user.plan === 'PRO' ? (
                  <span className="btn-pro" style={{ cursor: 'default' }}>
                    Pro
                  </span>
                ) : (
                  <button
                    type="button"
                    className="btn-pro"
                    onClick={() => void handleGetPro()}
                    disabled={proLoading}
                    aria-busy={proLoading}
                  >
                    {proLoading ? 'Upgrading…' : 'Get Pro'}
                  </button>
                )}
              </>
            ) : (
              <>
                <button type="button" className="action-link sign-in" onClick={openSignIn}>
                  Sign In
                </button>
                <button
                  type="button"
                  className="btn-pro"
                  onClick={() => void handleGetPro()}
                  disabled={proLoading}
                  aria-busy={proLoading}
                >
                  {proLoading ? 'Upgrading…' : 'Get Pro'}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {toast && (
        <div
          className={`header-toast header-toast--${toast.type}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      <AuthDialog
        open={authOpen}
        mode={authMode}
        subtitle={authSubtitle}
        onClose={closeAuthDialog}
        onAuthenticated={handleAuthSuccess}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
