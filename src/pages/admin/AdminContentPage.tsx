import { useEffect, useState } from 'react'
import {
  fetchContentPages,
  saveContentPage,
  type ContentPage,
} from '../../api/admin'
import './admin.css'

export function AdminContentPage() {
  const [pages, setPages] = useState<ContentPage[]>([])
  const [selected, setSelected] = useState<ContentPage | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchContentPages()
      .then((data) => {
        setPages(data.pages)
        if (data.pages[0]) selectPage(data.pages[0])
      })
      .catch((err: Error) => setError(err.message))
  }, [])

  function selectPage(page: ContentPage) {
    setSelected(page)
    setTitle(page.title)
    setBody(page.body)
    setMessage('')
  }

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const saved = await saveContentPage(selected.slug, { title, body })
      setPages((prev) =>
        prev.map((page) => (page.slug === saved.page.slug ? saved.page : page)),
      )
      setSelected(saved.page)
      setMessage(`Saved "${saved.page.slug}" page.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="admin-header">
        <h1>Content pages</h1>
        <button type="button" className="admin-btn" disabled={saving || !selected} onClick={handleSave}>
          {saving ? 'Saving...' : 'Save page'}
        </button>
      </div>
      {message && <div className="admin-message admin-message-success">{message}</div>}
      {error && <div className="admin-message admin-message-error">{error}</div>}

      <div className="admin-toolbar">
        {pages.map((page) => (
          <button
            key={page.slug}
            type="button"
            className={`admin-btn admin-btn-sm${selected?.slug === page.slug ? '' : ' admin-btn-secondary'}`}
            onClick={() => selectPage(page)}
          >
            {page.slug}
          </button>
        ))}
      </div>

      {selected && (
        <div className="admin-panel">
          <div className="admin-form-row">
            <label htmlFor="page-title">Title</label>
            <input
              id="page-title"
              className="admin-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="admin-form-row">
            <label htmlFor="page-body">Body (HTML supported)</label>
            <textarea
              id="page-body"
              className="admin-textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>
      )}
    </>
  )
}
