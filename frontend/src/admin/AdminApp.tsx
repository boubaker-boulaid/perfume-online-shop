import { Route, Routes } from 'react-router'
import '../styles/admin.css'
import { AdminLayout } from './AdminLayout'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { OrdersPage } from './pages/OrdersPage'
import { RequireAdmin } from './RequireAdmin'

// The admin's routes, under /admin. App.tsx loads this file with lazy(), which needs a default
// export, so customers never download the admin's code.
export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
