import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdminGuard } from './AdminGuard'

const mockUseAdminAuth = vi.hoisted(() => vi.fn())
vi.mock('@/hooks/useAdminAuth', () => ({ useAdminAuth: mockUseAdminAuth }))

const baseAuth = {
  user: null,
  loading: false,
  isAdmin: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
}

beforeEach(() => {
  mockUseAdminAuth.mockReturnValue({ ...baseAuth })
})

describe('AdminGuard', () => {
  it('si loading: no renderiza children ni redirige', () => {
    mockUseAdminAuth.mockReturnValue({ ...baseAuth, loading: true })
    render(
      <MemoryRouter>
        <AdminGuard>
          <div data-testid="child">protected</div>
        </AdminGuard>
      </MemoryRouter>,
    )
    expect(screen.queryByTestId('child')).not.toBeInTheDocument()
  })

  it('si !isAdmin: redirige a /admin/login', () => {
    mockUseAdminAuth.mockReturnValue({ ...baseAuth, loading: false, isAdmin: false })
    render(
      <MemoryRouter initialEntries={['/admin/productos']}>
        <Routes>
          <Route
            path="/admin/productos"
            element={
              <AdminGuard>
                <div data-testid="child">protected</div>
              </AdminGuard>
            }
          />
          <Route path="/admin/login" element={<div data-testid="login-page">login</div>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByTestId('child')).not.toBeInTheDocument()
  })

  it('si isAdmin: renderiza children', () => {
    mockUseAdminAuth.mockReturnValue({
      ...baseAuth,
      user: { id: 'user-1' },
      loading: false,
      isAdmin: true,
    })
    render(
      <MemoryRouter>
        <AdminGuard>
          <div data-testid="child">protected</div>
        </AdminGuard>
      </MemoryRouter>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
