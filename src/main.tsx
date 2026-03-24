import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import '@/styles/globals.css'
import { App } from '@/App'
import { AdminLogin } from '@/components/Admin/AdminLogin'
import { AdminGuard } from '@/components/Admin/AdminGuard'
import { AdminLayout } from '@/components/Admin/AdminLayout'
import { AdminProductos } from '@/components/Admin/AdminProductos'
import { AdminPedidos } from '@/components/Admin/AdminPedidos'
import { CheckoutSuccess } from '@/components/Checkout/CheckoutSuccess'
import { CheckoutFailure } from '@/components/Checkout/CheckoutFailure'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/checkout/failure" element={<CheckoutFailure />} />
        <Route path="/admin" element={<Navigate to="/admin/productos" replace />} />
        <Route
          path="/admin/productos"
          element={
            <AdminGuard>
              <AdminLayout>
                <AdminProductos />
              </AdminLayout>
            </AdminGuard>
          }
        />
        <Route
          path="/admin/pedidos"
          element={
            <AdminGuard>
              <AdminLayout>
                <AdminPedidos />
              </AdminLayout>
            </AdminGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
