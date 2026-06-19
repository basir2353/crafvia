import { useEffect, useState } from 'react'
import {
  fetchSiteConfig,
  saveSiteConfig,
  type SiteConfigItem,
} from '../../api/admin'
import './admin.css'

const knownKeys = [
  'donate_url',
  'pro_price_monthly',
  'stripe_checkout_url',
  'support_email',
]

export function AdminSiteConfigPage() {
  const [items, setItems] = useState<SiteConfigItem[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSiteConfig()
      .then((data) => {
        const map = new Map(data.items.map((item) => [item.key, item.value]))
        setItems(
          knownKeys.map((key) => ({
            key,
            value: map.get(key) ?? '',
          })),
        )
      })
      .catch((err: Error) => setError(err.message))
  }, [])

  async function handleSave() {
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const saved = await saveSiteConfig(items)
      setItems(saved.items.filter((item) => knownKeys.includes(item.key)))
      setMessage('Site settings saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="admin-header">
        <h1>Site config</h1>
        <button type="button" className="admin-btn" disabled={saving} onClick={handleSave}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
      {message && <div className="admin-message admin-message-success">{message}</div>}
      {error && <div className="admin-message admin-message-error">{error}</div>}
      <div className="admin-panel">
        {items.map((item, index) => (
          <div className="admin-form-row" key={item.key}>
            <label htmlFor={item.key}>{item.key}</label>
            <input
              id={item.key}
              className="admin-input"
              value={item.value}
              onChange={(e) => {
                const next = [...items]
                next[index] = { ...item, value: e.target.value }
                setItems(next)
              }}
            />
          </div>
        ))}
      </div>
    </>
  )
}
