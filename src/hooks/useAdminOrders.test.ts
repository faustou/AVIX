import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockChain = vi.hoisted(() => {
  const chain: any = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    update: vi.fn(),
  }
  chain.select.mockReturnValue(chain)
  chain.eq.mockReturnValue(chain)
  chain.order.mockResolvedValue({ data: [], error: null })
  chain.update.mockReturnValue(chain)
  return chain
})

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockChain),
  },
}))

import { useAdminOrders } from './useAdminOrders'

const mockOrders = [
  {
    id: 'o1',
    email: 'user@test.com',
    status: 'paid',
    total: 150,
    created_at: '2024-01-01T00:00:00Z',
    order_items: [
      {
        id: 'oi1',
        product_id: 'p1',
        size: 'M',
        quantity: 2,
        unit_price: 75,
        products: { code: 'ABC-001' },
      },
    ],
  },
  {
    id: 'o2',
    email: 'other@test.com',
    status: 'pending',
    total: 40,
    created_at: '2024-01-02T00:00:00Z',
    order_items: [],
  },
]

beforeEach(() => {
  mockChain.select.mockReset().mockReturnValue(mockChain)
  mockChain.eq.mockReset().mockReturnValue(mockChain)
  mockChain.order.mockReset().mockResolvedValue({ data: [], error: null })
  mockChain.update.mockReset().mockReturnValue(mockChain)
})

describe('useAdminOrders', () => {
  it('loading=true inicialmente', () => {
    const { result } = renderHook(() => useAdminOrders())
    expect(result.current.loading).toBe(true)
  })

  it('loading=false después del fetch', async () => {
    const { result } = renderHook(() => useAdminOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('filterStatus="all" por defecto', async () => {
    const { result } = renderHook(() => useAdminOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.filterStatus).toBe('all')
  })

  it('retorna orders con items mapeados correctamente', async () => {
    mockChain.order.mockResolvedValueOnce({ data: mockOrders, error: null })
    const { result } = renderHook(() => useAdminOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.orders).toHaveLength(2)
    const first = result.current.orders[0]
    expect(first.id).toBe('o1')
    expect(first.email).toBe('user@test.com')
    expect(first.status).toBe('paid')
    expect(first.total).toBe(150)
    expect(first.items).toHaveLength(1)
    expect(first.items[0].product_code).toBe('ABC-001')
    expect(first.items[0].size).toBe('M')
    expect(first.items[0].quantity).toBe(2)
    expect(first.items[0].unit_price).toBe(75)
  })

  it('al cambiar filterStatus a "paid" llama eq con status=paid', async () => {
    const { result } = renderHook(() => useAdminOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))

    mockChain.order.mockResolvedValueOnce({ data: [], error: null })
    await act(async () => {
      result.current.setFilterStatus('paid')
    })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(mockChain.eq).toHaveBeenCalledWith('status', 'paid')
    expect(result.current.filterStatus).toBe('paid')
  })

  it('si Supabase retorna error, error !== null', async () => {
    mockChain.order.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })
    const { result } = renderHook(() => useAdminOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('DB error')
  })

  it('refetch vuelve a hacer el fetch', async () => {
    const { result } = renderHook(() => useAdminOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const callsBefore = mockChain.order.mock.calls.length
    mockChain.order.mockResolvedValueOnce({ data: mockOrders, error: null })

    await act(async () => {
      await result.current.refetch()
    })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(mockChain.order.mock.calls.length).toBeGreaterThan(callsBefore)
    expect(result.current.orders).toHaveLength(2)
  })

  it('updateOrderStatus llama a supabase.update con el status correcto', async () => {
    mockChain.eq.mockResolvedValueOnce({ error: null })
    const { result } = renderHook(() => useAdminOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))

    mockChain.eq.mockResolvedValueOnce({ error: null })
    await act(async () => {
      await result.current.updateOrderStatus('o1', 'paid')
    })

    expect(mockChain.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'paid' }))
    expect(mockChain.eq).toHaveBeenCalledWith('id', 'o1')
  })

  it('updateOrderStatus con status="shipped" incluye shipped_at', async () => {
    const { result } = renderHook(() => useAdminOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))

    mockChain.eq.mockResolvedValueOnce({ error: null })
    await act(async () => {
      await result.current.updateOrderStatus('o1', 'shipped')
    })

    expect(mockChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'shipped', shipped_at: expect.any(String) }),
    )
  })

  it('updateOrderStatus con tracking number lo incluye en el update', async () => {
    const { result } = renderHook(() => useAdminOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))

    mockChain.eq.mockResolvedValueOnce({ error: null })
    await act(async () => {
      await result.current.updateOrderStatus('o1', 'shipped', 'TRACK-123')
    })

    expect(mockChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ tracking_number: 'TRACK-123' }),
    )
  })

  it('updateOrderStatus retorna null si ok', async () => {
    const { result } = renderHook(() => useAdminOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))

    mockChain.eq.mockResolvedValueOnce({ error: null })
    let returnValue: string | null = 'initial'
    await act(async () => {
      returnValue = await result.current.updateOrderStatus('o1', 'paid')
    })

    expect(returnValue).toBeNull()
  })

  it('updateOrderStatus retorna mensaje de error si falla', async () => {
    const { result } = renderHook(() => useAdminOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))

    mockChain.eq.mockResolvedValueOnce({ error: { message: 'update failed' } })
    let returnValue: string | null = null
    await act(async () => {
      returnValue = await result.current.updateOrderStatus('o1', 'paid')
    })

    expect(returnValue).toBe('update failed')
  })
})
