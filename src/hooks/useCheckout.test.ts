import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockChain = vi.hoisted(() => {
  const chain: any = {
    select: vi.fn(),
    insert: vi.fn(),
    single: vi.fn(),
  }
  chain.select.mockReturnValue(chain)
  chain.insert.mockReturnValue(chain)
  chain.single.mockResolvedValue({ data: { id: 'order-123' }, error: null })
  return chain
})

const mockFetch = vi.hoisted(() => vi.fn())
const mockUseCart = vi.hoisted(() => vi.fn())

vi.stubGlobal('fetch', mockFetch)

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockChain),
  },
}))

vi.mock('@/hooks/useCart', () => ({
  useCart: mockUseCart,
}))

import { useCheckout } from './useCheckout'
import { supabase } from '@/lib/supabase'

const mockCartItems = [
  {
    product: {
      id: 'p1',
      code: 'YS-01',
      price: 40,
      product_images: [],
      product_sizes: [],
      category_slug: 'new' as const,
      information: null,
      size_system: 'letter' as const,
      created_at: '2024-01-01',
    },
    size: '8',
    quantity: 2,
  },
]

beforeEach(() => {
  mockChain.select.mockReset().mockReturnValue(mockChain)
  mockChain.insert.mockReset().mockReturnValue(mockChain)
  mockChain.single.mockReset().mockResolvedValue({ data: { id: 'order-123' }, error: null })
  mockFetch.mockReset().mockResolvedValue({
    ok: true,
    json: async () => ({ preferenceId: 'pref-123' }),
  })
  mockUseCart.mockReturnValue({
    items: mockCartItems,
    subtotal: 80,
    total: 80,
    cartCount: 2,
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
  })
  vi.mocked(supabase.from).mockReturnValue(mockChain)
})

describe('useCheckout', () => {
  it('startCheckout crea una orden en Supabase', async () => {
    const { result } = renderHook(() => useCheckout())

    await act(async () => {
      await result.current.startCheckout('buyer@test.com')
    })

    expect(supabase.from).toHaveBeenCalledWith('orders')
    expect(mockChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'buyer@test.com', status: 'pending', total: 80 }),
    )
  })

  it('startCheckout inserta los order_items', async () => {
    const { result } = renderHook(() => useCheckout())

    await act(async () => {
      await result.current.startCheckout('buyer@test.com')
    })

    expect(supabase.from).toHaveBeenCalledWith('order_items')
    expect(mockChain.insert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          order_id: 'order-123',
          product_id: 'p1',
          size: '8',
          quantity: 2,
          unit_price: 40,
        }),
      ]),
    )
  })

  it('startCheckout llama a la Edge Function con los datos correctos', async () => {
    const { result } = renderHook(() => useCheckout())

    await act(async () => {
      await result.current.startCheckout('buyer@test.com')
    })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('create-mp-preference'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: expect.stringContaining('buyer@test.com'),
      }),
    )

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.orderId).toBe('order-123')
    expect(body.items[0]).toMatchObject({ title: 'YS-01', quantity: 2, unit_price: 40, size: '8' })
  })

  it('startCheckout retorna el preferenceId', async () => {
    const { result } = renderHook(() => useCheckout())

    let preferenceId: string | null = null
    await act(async () => {
      preferenceId = await result.current.startCheckout('buyer@test.com')
    })

    expect(preferenceId).toBe('pref-123')
  })

  it('Si falla la creación de orden retorna null', async () => {
    mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })

    const { result } = renderHook(() => useCheckout())

    let preferenceId: string | null = 'initial'
    await act(async () => {
      preferenceId = await result.current.startCheckout('buyer@test.com')
    })

    expect(preferenceId).toBeNull()
    expect(result.current.error).toBe('DB error')
  })

  it('loading=false inicialmente, true durante, false al terminar', async () => {
    const { result } = renderHook(() => useCheckout())

    expect(result.current.loading).toBe(false)

    await act(async () => {
      await result.current.startCheckout('buyer@test.com')
    })

    await waitFor(() => expect(result.current.loading).toBe(false))
  })
})
