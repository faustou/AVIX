import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MOCK_PRODUCTS_DB } from '@/test/mocks/supabase'

const mockChain = vi.hoisted(() => ({
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockChain),
    storage: {
      from: vi.fn(() => ({
        getPublicUrl: vi.fn((path: string) => ({
          data: { publicUrl: `https://example.com/${path}` },
        })),
      })),
    },
  },
}))

import { useProducts } from './useProducts'

beforeEach(() => {
  mockChain.select.mockReset().mockReturnValue(mockChain)
  mockChain.eq.mockReset().mockReturnValue(mockChain)
  mockChain.order.mockReset().mockResolvedValue({ data: MOCK_PRODUCTS_DB, error: null })
})

describe('useProducts', () => {
  it('retorna loading=true inicialmente', () => {
    const { result } = renderHook(() => useProducts('new'))
    expect(result.current.loading).toBe(true)
  })

  it('retorna loading=false cuando termina el fetch', async () => {
    const { result } = renderHook(() => useProducts('new'))
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('retorna productos mapeados correctamente', async () => {
    const { result } = renderHook(() => useProducts('new'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.products).toHaveLength(2)
    expect(result.current.products[0].code).toBe('YS-01')
    expect(result.current.products[0].product_sizes[0].stock).toBe(3)
  })

  it('las URLs de imágenes son URLs públicas completas', async () => {
    const { result } = renderHook(() => useProducts('new'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    const url = result.current.products[0].product_images[0].storage_path
    expect(url).toMatch(/^https:\/\//)
    expect(url).toContain('products/ys-01.jpg')
  })

  it('para category="new" no filtra por category_slug', async () => {
    const { result } = renderHook(() => useProducts('new'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    const slugCall = mockChain.eq.mock.calls.find((c) => c[0] === 'category_slug')
    expect(slugCall).toBeUndefined()
  })

  it('para otras categorías filtra por category_slug', async () => {
    const { result } = renderHook(() => useProducts('remeras'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    const slugCall = mockChain.eq.mock.calls.find((c) => c[0] === 'category_slug')
    expect(slugCall).toBeDefined()
    expect(slugCall![1]).toBe('remeras')
  })

  it('si Supabase retorna error, error !== null', async () => {
    mockChain.order.mockResolvedValueOnce({ data: null, error: { message: 'Network error' } })
    const { result } = renderHook(() => useProducts('new'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Network error')
    expect(result.current.products).toHaveLength(0)
  })

  it('retorna error=null cuando no hay error', async () => {
    const { result } = renderHook(() => useProducts('new'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeNull()
  })
})
