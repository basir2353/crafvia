import { useEffect, useState } from 'react'
import { fetchAdminUsers, updateUser, type AdminUser } from '../../api/admin'
import './admin.css'

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function load(search = query) {
    try {
      const data = await fetchAdminUsers(search)
      setUsers(data.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function patchUser(id: string, data: { plan?: 'FREE' | 'PRO'; role?: 'USER' | 'ADMIN' }) {
    setMessage('')
    setError('')
    try {
      const saved = await updateUser(id, data)
      setUsers((prev) => prev.map((user) => (user.id === saved.user.id ? saved.user : user)))
      setMessage(`Updated ${saved.user.email}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  return (
    <>
      <div className="admin-header">
        <h1>Users</h1>
      </div>
      {message && <div className="admin-message admin-message-success">{message}</div>}
      {error && <div className="admin-message admin-message-error">{error}</div>}

      <div className="admin-toolbar">
        <input
          className="admin-input"
          style={{ maxWidth: 320 }}
          placeholder="Search users..."
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
              <th>Email</th>
              <th>Plan</th>
              <th>Role</th>
              <th>Jobs</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <strong>{user.email}</strong>
                  {user.name && <div style={{ color: '#64748b' }}>{user.name}</div>}
                </td>
                <td>
                  <span className={`admin-badge ${user.plan === 'PRO' ? 'admin-badge-blue' : 'admin-badge-gray'}`}>
                    {user.plan}
                  </span>
                </td>
                <td>
                  <span className={`admin-badge ${user.role === 'ADMIN' ? 'admin-badge-green' : 'admin-badge-gray'}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user._count.processingJobs}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                      onClick={() => patchUser(user.id, { plan: user.plan === 'PRO' ? 'FREE' : 'PRO' })}
                    >
                      Toggle plan
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm"
                      onClick={() => patchUser(user.id, { role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' })}
                    >
                      Toggle admin
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
