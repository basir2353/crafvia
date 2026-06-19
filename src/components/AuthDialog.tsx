import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'

type Props = {
  open: boolean
  mode: 'signin' | 'signup'
  onClose: () => void
  onAuthenticated?: () => void | Promise<void>
  subtitle?: string
}

export function AuthDialog({
  open,
  mode: initialMode,
  onClose,
  onAuthenticated,
  subtitle,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) setMode(initialMode)
  }, [open, initialMode])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
    return undefined
  }, [open])

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setName('')
    setError(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password, name || undefined)
      }
      resetForm()
      onClose()
      await onAuthenticated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <dialog ref={dialogRef} className="auth-dialog" onClose={onClose}>
      <form className="auth-dialog-form" onSubmit={handleSubmit}>
        <h2 className="auth-dialog-title">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h2>
        {subtitle && <p className="auth-dialog-subtitle">{subtitle}</p>}
        {mode === 'signup' && (
          <input
            className="search-input auth-dialog-input"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Name"
          />
        )}
        <input
          className="search-input auth-dialog-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label="Email"
        />
        <input
          className="search-input auth-dialog-input"
          type="password"
          placeholder="Password (min. 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          aria-label="Password"
        />
        {error && (
          <p className="auth-dialog-error" role="alert">
            {error}
          </p>
        )}
        <p className="auth-dialog-switch">
          {mode === 'signin' ? (
            <>
              No account?{' '}
              <button type="button" className="auth-dialog-link" onClick={() => setMode('signup')}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" className="auth-dialog-link" onClick={() => setMode('signin')}>
                Sign in
              </button>
            </>
          )}
        </p>
        <div className="auth-dialog-actions">
          <button type="button" className="action-link" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-pro" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
