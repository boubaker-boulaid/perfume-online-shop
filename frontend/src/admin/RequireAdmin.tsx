import { Navigate, Outlet } from 'react-router'
import { useApi } from '../hooks/useApi'
import { ApiError } from '../services/apiError'
import { getMe } from './adminApi'

// Hiding the admin pages here protects nothing: anyone can read the JavaScript. The backend's
// auth:sanctum and admin middleware are the real protection. This only spares the admin empty
// pages: the admin is logged in when /api/v1/admin/me says so, and that's the only truth.
export function RequireAdmin() {
  const { data: admin, error, loading } = useApi(getMe, 'me')

  if (loading) return <p className="admin-loading">Chargement…</p>

  // logged in, but not an admin
  if (error instanceof ApiError && error.status === 403) {
    return <p className="admin-loading">Ce compte n’a pas accès à l’administration.</p>
  }

  if (!admin) return <Navigate to="/admin/login" replace />

  // the pages below read the admin with useOutletContext<Admin>()
  return <Outlet context={admin} />
}
