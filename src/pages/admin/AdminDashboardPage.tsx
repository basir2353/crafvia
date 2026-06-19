import { useEffect, useState } from 'react'
import { fetchAdminDashboard, type AdminDashboard } from '../../api/admin'
import './admin.css'

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAdminDashboard()
      .then(setData)
      .catch((err: Error) => setError(err.message))
  }, [])

  if (error) return <div className="admin-message admin-message-error">{error}</div>
  if (!data) return <p>Loading dashboard...</p>

  return (
    <>
      <div className="admin-header">
        <h1>Dashboard</h1>
      </div>

      <div className="admin-card-grid">
        <div className="admin-stat-card"><strong>{data.users.total}</strong><span>Total users</span></div>
        <div className="admin-stat-card"><strong>{data.users.pro}</strong><span>Pro users</span></div>
        <div className="admin-stat-card"><strong>{data.tools.active}</strong><span>Active tools</span></div>
        <div className="admin-stat-card"><strong>{data.jobs.today}</strong><span>Jobs today</span></div>
        <div className="admin-stat-card"><strong>{data.jobs.completed}</strong><span>Completed jobs</span></div>
        <div className="admin-stat-card"><strong>{data.jobs.failed}</strong><span>Failed jobs</span></div>
      </div>

      <div className="admin-panel">
        <h2>Top tools</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Tool</th><th>Jobs</th></tr>
            </thead>
            <tbody>
              {data.topTools.map((tool) => (
                <tr key={tool.toolSlug}>
                  <td>{tool.toolSlug}</td>
                  <td>{tool.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Recent jobs</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Tool</th><th>Status</th><th>User</th><th>When</th></tr>
            </thead>
            <tbody>
              {data.recentJobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.toolSlug}</td>
                  <td>{job.status}</td>
                  <td>{job.user?.email ?? 'Guest'}</td>
                  <td>{new Date(job.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
