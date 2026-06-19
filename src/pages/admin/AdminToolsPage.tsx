import { useEffect, useState } from 'react'
import { fetchAdminTools, updateTool, type AdminTool } from '../../api/admin'
import './admin.css'

export function AdminToolsPage() {
  const [tools, setTools] = useState<AdminTool[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function load(search = query) {
    try {
      const data = await fetchAdminTools(search)
      setTools(data.tools)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tools')
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleTool(tool: AdminTool, field: 'isActive' | 'isPopular' | 'requiresPro') {
    setMessage('')
    setError('')
    try {
      const saved = await updateTool(tool.id, { [field]: !tool[field] })
      setTools((prev) => prev.map((item) => (item.id === saved.tool.id ? saved.tool : item)))
      setMessage(`Updated ${saved.tool.name}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  return (
    <>
      <div className="admin-header">
        <h1>Tools</h1>
      </div>
      {message && <div className="admin-message admin-message-success">{message}</div>}
      {error && <div className="admin-message admin-message-error">{error}</div>}

      <div className="admin-toolbar">
        <input
          className="admin-input"
          style={{ maxWidth: 320 }}
          placeholder="Search tools..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="button" className="admin-btn admin-btn-secondary" onClick={() => load(query)}>
          Search
        </button>
      </div>

      <div className="admin-panel admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Active</th>
              <th>Popular</th>
              <th>Pro</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((tool) => (
              <tr key={tool.id}>
                <td>
                  <strong>{tool.name}</strong>
                  <div style={{ color: '#64748b', fontSize: '0.8125rem' }}>{tool.slug}</div>
                </td>
                <td>{tool.category.name}</td>
                <td>
                  <button type="button" className="admin-btn admin-btn-sm" onClick={() => toggleTool(tool, 'isActive')}>
                    {tool.isActive ? 'Active' : 'Hidden'}
                  </button>
                </td>
                <td>
                  <button type="button" className="admin-btn admin-btn-sm admin-btn-secondary" onClick={() => toggleTool(tool, 'isPopular')}>
                    {tool.isPopular ? 'Popular' : 'Normal'}
                  </button>
                </td>
                <td>
                  <button type="button" className="admin-btn admin-btn-sm admin-btn-secondary" onClick={() => toggleTool(tool, 'requiresPro')}>
                    {tool.requiresPro ? 'Pro' : 'Free'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
