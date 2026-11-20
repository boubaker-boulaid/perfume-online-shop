import { Route, Routes } from 'react-router'
import '../styles/admin.css'
import { AdminLayout } from './AdminLayout'
import { CategoriesPage } from './pages/CategoriesPage'
import { CategoryFormPage } from './pages/CategoryFormPage'
import { DashboardPage } from './pages/DashboardPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { OfferFormPage } from './pages/OfferFormPage'
import { OffersAdminPage } from './pages/OffersAdminPage'
import { OrderPage } from './pages/OrderPage'
import { OrdersPage } from './pages/OrdersPage'
import { ProductFormPage } from './pages/ProductFormPage'
import { ProductsPage } from './pages/ProductsPage'
import { RequireAdmin } from './RequireAdmin'

// The admin's routes, under /admin. App.tsx loads this file with lazy(), which needs a default
// export, so customers never download the admin's code.
export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:orderNumber" element={<OrderPage />} />
          <Route path="products" element={<ProductsPage />} />
          {/* key="new": coming from an edit form, "new" must start from an empty form */}
          <Route path="products/new" element={<ProductFormPage key="new" />} />
          <Route path="products/:slug" element={<ProductFormPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="categories/new" element={<CategoryFormPage key="new" />} />
          <Route path="categories/:slug" element={<CategoryFormPage />} />
          <Route path="offers" element={<OffersAdminPage />} />
          <Route path="offers/new" element={<OfferFormPage key="new" />} />
          <Route path="offers/:slug" element={<OfferFormPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
