import { NavLink, Outlet, useNavigate, useOutletContext } from 'react-router'
import { logout } from './adminApi'
import type { Admin } from './types'

const LINKS = [
  { to: '/admin', label: 'Tableau de bord', end: true },
  { to: '/admin/orders', label: 'Commandes', end: false },
]

export function AdminLayout() {
  const admin = useOutletContext<Admin>()
  const navigate = useNavigate()

  const signOut = async () => {
    await logout().catch(() => undefined) // even if it fails, leave the admin
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin">
      <aside className="admin-nav">
        <strong className="admin-nav__brand">Lumé · Admin</strong>
        {/* NavLink adds the "active" class on its page. end: only on this exact address */}
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className="admin-nav__link">
            {link.label}
          </NavLink>
        ))}
        <span className="admin-nav__user">{admin.name}</span>
        <button type="button" className="admin-nav__logout" onClick={signOut}>
          Se déconnecter
        </button>
      </aside>
      <main className="admin-main">
        <Outlet context={admin} />
      </main>
    </div>
  )
}
