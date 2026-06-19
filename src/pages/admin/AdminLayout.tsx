import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './admin.css'

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/site-config', label: 'Site Config' },
  { to: '/admin/content', label: 'Content Pages' },
  { to: '/admin/tools', label: 'Tools' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/users', label: 'Users' },
]

export function AdminLayout() {
  const { user, signOut } = useAuth()

  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          Craf<span>via</span> Admin
        </div>
        <nav className="admin-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `admin-nav-link${isActive ? ' active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: '24px 8px 0', fontSize: '0.8125rem' }}>
          <div style={{ marginBottom: 8, color: '#94a3b8' }}>{user?.email}</div>
          <Link to="/" className="admin-nav-link" style={{ display: 'inline-block' }}>
            View site
          </Link>
          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-sm"
            style={{ marginTop: 8, width: '100%' }}
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
