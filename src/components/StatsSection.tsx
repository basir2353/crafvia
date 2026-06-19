import { useEffect, useState } from 'react'
import { fetchStats } from '../api/stats'

const fallbackStats = [
  { value: '180+', label: 'Tools' },
  { value: '0', label: 'Files Uploaded to Servers' },
  { value: '50M+', label: 'Files Processed' },
  { value: '100%', label: 'Free Basic Access' },
]

export function StatsSection() {
  const [stats, setStats] = useState(fallbackStats)

  useEffect(() => {
    fetchStats()
      .then((data) => {
        setStats([
          { value: data.tools, label: 'Tools' },
          { value: data.filesUploadedToServers, label: 'Files Uploaded to Servers' },
          { value: data.filesProcessed, label: 'Files Processed' },
          { value: data.freeBasicAccess, label: 'Free Basic Access' },
        ])
      })
      .catch(() => {
        // keep fallback values
      })
  }, [])

  return (
    <section className="stats-section">
      <ul className="stats-grid">
        {stats.map((stat) => (
          <li key={stat.label}>
            <div className="stat-card">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
