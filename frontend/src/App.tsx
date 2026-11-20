import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from './components/layout/Layout'
import { CartProvider } from './context/CartProvider'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OfferPage } from './pages/OfferPage'
import { OffersPage } from './pages/OffersPage'
import { OrderConfirmationPage } from './pages/OrderConfirmationPage'
import { ProductPage } from './pages/ProductPage'
import { ShopPage } from './pages/ShopPage'

// A separate file, downloaded only when someone opens /admin
const AdminApp = lazy(() => import('./admin/AdminApp'))
// The link in the password reset e-mail, outside /admin because the backend chose the address
const ResetPasswordPage = lazy(() => import('./admin/pages/ResetPasswordPage'))

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="admin/*"
            element={
              <Suspense fallback={<p className="admin-loading">Chargement…</p>}>
                <AdminApp />
              </Suspense>
            }
          />
          <Route
            path="password-reset/:token"
            element={
              <Suspense fallback={<p className="admin-loading">Chargement…</p>}>
                <ResetPasswordPage />
              </Suspense>
            }
          />
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="shop/:slug" element={<ProductPage />} />
            <Route path="offers" element={<OffersPage />} />
            <Route path="offers/:slug" element={<OfferPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}
