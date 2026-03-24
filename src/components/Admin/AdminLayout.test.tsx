import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdminLayout } from './AdminLayout'

const mockUseAdminAuth = vi.hoisted(() => vi.fn())
vi.mock('@/hooks/useAdminAuth', () => ({ useAdminAuth: mockUseAdminAuth }))

const mockSignOut = vi.fn()

beforeEach(() => {
  mockSignOut.mockReset().mockResolvedValue(undefined)
  mockUseAdminAuth.mockReturnValue({
    user: { id: 'user-1' },
    loading: false,
    isAdmin: true,
    signIn: vi.fn(),
    signOut: mockSignOut,
  })
})

describe('AdminLayout', () => {
  it('renderiza tabs PRODUCTOS y PEDIDOS', () => {
    render(
      <MemoryRouter initialEntries={['/admin/productos']}>
        <AdminLayout>content</AdminLayout>
      </MemoryRouter>,
    )
    expect(screen.getByTestId('tab-productos')).toBeInTheDocument()
    expect(screen.getByTestId('tab-pedidos')).toBeInTheDocument()
  })

  it('tab PRODUCTOS activo por defecto en /admin/productos', () => {
    render(
      <MemoryRouter initialEntries={['/admin/productos']}>
        <AdminLayout>content</AdminLayout>
      </MemoryRouter>,
    )
    expect(screen.getByTestId('tab-productos')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('tab-pedidos')).toHaveAttribute('data-active', 'false')
  })

  it('al tocar PEDIDOS navega a /admin/pedidos y el tab cambia', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/productos']}>
        <Routes>
          <Route path="/admin/productos" element={<AdminLayout>productos</AdminLayout>} />
          <Route path="/admin/pedidos" element={<AdminLayout>pedidos</AdminLayout>} />
        </Routes>
      </MemoryRouter>,
    )
    const user = userEvent.setup()
    await user.click(screen.getByTestId('tab-pedidos'))
    expect(screen.getByTestId('tab-pedidos')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('tab-productos')).toHaveAttribute('data-active', 'false')
  })

  it('botón cerrar sesión llama a signOut', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/productos']}>
        <AdminLayout>content</AdminLayout>
      </MemoryRouter>,
    )
    const user = userEvent.setup()
    await user.click(screen.getByTestId('sign-out-button'))
    expect(mockSignOut).toHaveBeenCalled()
  })
})
