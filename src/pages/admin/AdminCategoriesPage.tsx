import { useEffect, useState } from 'react'
import { fetchAdminCategories, updateCategory, type AdminCategory } from '../../api/admin'
import './admin.css'

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchAdminCategories()
      .then((data) => setCategories(data.categories))
      .catch((err: Error) => setError(err.message))
  }, [])

  async function saveCategory(category: AdminCategory) {
    setMessage('')
    setError('')
    try {
      const saved = await updateCategory(category.id, {
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
      })
      setCategories((prev) =>
        prev.map((item) => (item.id === saved.category.id ? saved.category : item)),
      )
      setMessage(`Saved ${saved.category.name}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    }
  }

  return (
    <>
      <div className="admin-header">
        <h1>Categories</h1>
      </div>
      {message && <div className="admin-message admin-message-success">{message}</div>}
      {error && <div className="admin-message admin-message-error">{error}</div>}

      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Tools</th>
                <th>Sort</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category.id}>
                  <td>
                    <input
                      className="admin-input"
                      value={category.name}
                      onChange={(e) => {
                        const next = [...categories]
                        next[index] = { ...category, name: e.target.value }
                        setCategories(next)
                      }}
                    />
                  </td>
                  <td>{category.slug}</td>
                  <td>{category._count.tools}</td>
                  <td>
                    <input
                      className="admin-input"
                      type="number"
                      value={category.sortOrder}
                      onChange={(e) => {
                        const next = [...categories]
                        next[index] = { ...category, sortOrder: Number(e.target.value) }
                        setCategories(next)
                      }}
                    />
                  </td>
                  <td>
                    <button type="button" className="admin-btn admin-btn-sm" onClick={() => saveCategory(category)}>
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
