import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdminLogin } from './AdminLogin'

const mockUseAdminAuth = vi.hoisted(() => vi.fn())
vi.mock('@/hooks/useAdminAuth', () => ({ useAdminAuth: mockUseAdminAuth }))

const mockSignIn = vi.fn()

beforeEach(() => {
  mockSignIn.mockReset().mockResolvedValue(null)
  mockUseAdminAuth.mockReturnValue({
    user: null,
    loading: false,
    isAdmin: false,
    signIn: mockSignIn,
    signOut: vi.fn(),
  })
})

function renderLogin() {
  render(
    <MemoryRouter>
      <AdminLogin />
    </MemoryRouter>,
  )
}

describe('AdminLogin', () => {
  it('renderiza el formulario de login', () => {
    renderLogin()
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('no muestra error inicialmente', () => {
    renderLogin()
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
  })

  it('al completar email y password y tocar INGRESAR llama a signIn', async () => {
    renderLogin()
    const user = userEvent.setup()
    await user.type(screen.getByTestId('email-input'), 'admin@avix.com')
    await user.type(screen.getByTestId('password-input'), 'password123')
    await user.click(screen.getByTestId('submit-button'))
    expect(mockSignIn).toHaveBeenCalledWith('admin@avix.com', 'password123')
  })

  it('muestra mensaje de error si signIn retorna error', async () => {
    mockSignIn.mockResolvedValueOnce('Invalid login credentials')
    renderLogin()
    const user = userEvent.setup()
    await user.type(screen.getByTestId('email-input'), 'admin@avix.com')
    await user.type(screen.getByTestId('password-input'), 'wrong')
    await user.click(screen.getByTestId('submit-button'))
    expect(screen.getByTestId('error-message')).toBeInTheDocument()
    expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid login credentials')
  })
})
