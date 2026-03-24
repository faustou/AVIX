import { useNavigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import styles from './AdminLayout.module.css'
import { useAdminAuth } from '@/hooks/useAdminAuth'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const activeTab = location.pathname.includes('pedidos') ? 'pedidos' : 'productos'

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.brand}>AVIX ADMIN</span>
        <button
          className={styles.signOut}
          onClick={handleSignOut}
          data-testid="sign-out-button"
        >
          CERRAR SESIÓN
        </button>
      </header>

      <nav className={styles.tabs} aria-label="Admin navigation">
        <button
          className={styles.tab}
          data-active={activeTab === 'productos' ? 'true' : 'false'}
          onClick={() => navigate('/admin/productos')}
          data-testid="tab-productos"
        >
          PRODUCTOS
        </button>
        <button
          className={styles.tab}
          data-active={activeTab === 'pedidos' ? 'true' : 'false'}
          onClick={() => navigate('/admin/pedidos')}
          data-testid="tab-pedidos"
        >
          PEDIDOS
        </button>
      </nav>

      <main className={styles.content}>
        {children}
      </main>
    </div>
  )
}
