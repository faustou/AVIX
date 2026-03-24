import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAdminsChain = vi.hoisted(() => {
  const chain: any = {
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
  }
  chain.select.mockReturnValue(chain)
  chain.eq.mockReturnValue(chain)
  chain.single.mockResolvedValue({ data: null, error: null })
  return chain
})

const mockAuth = vi.hoisted(() => ({
  getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  onAuthStateChange: vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  }),
  signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: mockAuth,
    from: vi.fn(() => mockAdminsChain),
  },
}))

import { useAdminAuth } from './useAdminAuth'

const mockUser = { id: 'user-1', email: 'admin@avix.com' }

beforeEach(() => {
  mockAdminsChain.select.mockReset().mockReturnValue(mockAdminsChain)
  mockAdminsChain.eq.mockReset().mockReturnValue(mockAdminsChain)
  mockAdminsChain.single.mockReset().mockResolvedValue({ data: null, error: null })
  mockAuth.getSession.mockReset().mockResolvedValue({ data: { session: null }, error: null })
  mockAuth.onAuthStateChange.mockReset().mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  })
  mockAuth.signInWithPassword.mockReset().mockResolvedValue({ error: null })
  mockAuth.signOut.mockReset().mockResolvedValue({ error: null })
})

describe('useAdminAuth', () => {
  it('loading=true inicialmente', () => {
    const { result } = renderHook(() => useAdminAuth())
    expect(result.current.loading).toBe(true)
  })

  it('loading=false después de getSession', async () => {
    const { result } = renderHook(() => useAdminAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('signIn llama a supabase.auth.signInWithPassword', async () => {
    const { result } = renderHook(() => useAdminAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.signIn('admin@avix.com', 'password123')
    })
    expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
      email: 'admin@avix.com',
      password: 'password123',
    })
  })

  it('signIn retorna null si ok', async () => {
    const { result } = renderHook(() => useAdminAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    let returnValue: string | null = 'initial'
    await act(async () => {
      returnValue = await result.current.signIn('admin@avix.com', 'password123')
    })
    expect(returnValue).toBeNull()
  })

  it('signIn retorna mensaje de error si falla', async () => {
    mockAuth.signInWithPassword.mockResolvedValueOnce({
      error: { message: 'Invalid login credentials' },
    })
    const { result } = renderHook(() => useAdminAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    let returnValue: string | null = null
    await act(async () => {
      returnValue = await result.current.signIn('admin@avix.com', 'wrong')
    })
    expect(returnValue).toBe('Invalid login credentials')
  })

  it('isAdmin=true si el user existe en tabla admins', async () => {
    mockAuth.getSession.mockResolvedValueOnce({
      data: { session: { user: mockUser } },
      error: null,
    })
    mockAdminsChain.single.mockResolvedValueOnce({ data: { id: 'user-1' }, error: null })
    const { result } = renderHook(() => useAdminAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.isAdmin).toBe(true)
  })

  it('isAdmin=false si el user no existe en tabla admins', async () => {
    mockAuth.getSession.mockResolvedValueOnce({
      data: { session: { user: mockUser } },
      error: null,
    })
    mockAdminsChain.single.mockResolvedValueOnce({ data: null, error: null })
    const { result } = renderHook(() => useAdminAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.isAdmin).toBe(false)
  })

  it('signOut llama a supabase.auth.signOut', async () => {
    const { result } = renderHook(() => useAdminAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.signOut()
    })
    expect(mockAuth.signOut).toHaveBeenCalled()
  })
})
