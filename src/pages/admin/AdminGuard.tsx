import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { AuthDialog } from '../../components/AuthDialog'
import { useState } from 'react'
import './admin.css'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="admin-gate">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <div className="admin-gate">
          <h1>Admin sign in required</h1>
          <p style={{ color: '#64748b', marginBottom: 20 }}>
            Sign in with an admin account to access the control panel.
          </p>
          <button type="button" className="admin-btn" onClick={() => setAuthOpen(true)}>
            Sign in
          </button>
        </div>
        <AuthDialog open={authOpen} mode="signin" onClose={() => setAuthOpen(false)} />
      </>
    )
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="admin-gate">
        <h1>Access denied</h1>
        <p style={{ color: '#64748b' }}>
          Your account does not have admin privileges. Add your email to{' '}
          <code>ADMIN_EMAILS</code> on the server, then sign in again.
        </p>
        <Link to="/" className="admin-btn admin-btn-secondary" style={{ display: 'inline-block', marginTop: 16 }}>
          Back to site
        </Link>
      </div>
    )
  }

  return <>{children}</>
}
