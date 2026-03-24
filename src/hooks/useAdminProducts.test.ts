import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockChain = vi.hoisted(() => {
  const chain: any = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    single: vi.fn(),
  }
  chain.select.mockReturnValue(chain)
  chain.eq.mockReturnValue(chain)
  chain.order.mockResolvedValue({ data: [], error: null })
  chain.insert.mockReturnValue(chain)
  chain.update.mockReturnValue(chain)
  chain.delete.mockReturnValue(chain)
  chain.single.mockResolvedValue({ data: null, error: null })
  return chain
})

const mockStorage = vi.hoisted(() => ({
  from: vi.fn(() => ({
    upload: vi.fn().mockResolvedValue({ data: { path: 'test-path.jpg' }, error: null }),
    remove: vi.fn().mockResolvedValue({ data: null, error: null }),
    getPublicUrl: vi.fn((path: string) => ({ data: { publicUrl: `https://cdn.test/${path}` } })),
  })),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockChain),
    storage: mockStorage,
  },
}))

import { useAdminProducts } from './useAdminProducts'

const mockProducts = [
  {
    id: 'p1',
    code: 'ABC-001',
    category_slug: 'mens',
    price: 100,
    information: null,
    size_system: 'letter',
    created_at: '2024-01-01',
    published: true,
    product_images: [{ id: 'i1', storage_path: 'img1.jpg', position: 0 }],
    product_sizes: [{ id: 's1', size_us: 'M', size_eu: null, stock: 3 }],
  },
]

beforeEach(() => {
  mockChain.select.mockReset().mockReturnValue(mockChain)
  mockChain.eq.mockReset().mockReturnValue(mockChain)
  mockChain.order.mockReset().mockResolvedValue({ data: [], error: null })
  mockChain.insert.mockReset().mockReturnValue(mockChain)
  mockChain.update.mockReset().mockReturnValue(mockChain)
  mockChain.delete.mockReset().mockReturnValue(mockChain)
  mockChain.single.mockReset().mockResolvedValue({ data: null, error: null })
})

describe('useAdminProducts', () => {
  it('loading=true inicialmente', () => {
    const { result } = renderHook(() => useAdminProducts())
    expect(result.current.loading).toBe(true)
  })

  it('loading=false después de fetch', async () => {
    const { result } = renderHook(() => useAdminProducts())
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('fetchea productos sin filtro published', async () => {
    mockChain.order.mockResolvedValueOnce({ data: mockProducts, error: null })
    const { result } = renderHook(() => useAdminProducts())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.products).toHaveLength(1)
    expect(result.current.products[0].code).toBe('ABC-001')
  })

  it('error de fetch se expone en error', async () => {
    mockChain.order.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })
    const { result } = renderHook(() => useAdminProducts())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('DB error')
  })

  it('createProduct inserta producto y llama refetch', async () => {
    mockChain.single.mockResolvedValueOnce({ data: { id: 'new-id' }, error: null })
    const { result } = renderHook(() => useAdminProducts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let returnValue: string | null = 'initial'
    await act(async () => {
      returnValue = await result.current.createProduct({
        code: 'NEW-001',
        category_slug: 'mens',
        price: 50,
        information: '',
        size_system: 'letter',
        published: false,
        images: [],
        sizes: [],
      })
    })
    expect(returnValue).toBeNull()
    expect(mockChain.insert).toHaveBeenCalled()
  })

  it('togglePublished llama update con el valor correcto', async () => {
    const { result } = renderHook(() => useAdminProducts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.togglePublished('p1', true)
    })
    expect(mockChain.update).toHaveBeenCalledWith({ published: true })
    expect(mockChain.eq).toHaveBeenCalledWith('id', 'p1')
  })

  it('uploadImage sube archivo y retorna path', async () => {
    const uploadMock = vi.fn().mockResolvedValue({ data: { path: 'uploaded.jpg' }, error: null })
    mockStorage.from.mockReturnValueOnce({
      upload: uploadMock,
      remove: vi.fn(),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/img.jpg' } }),
    })

    const { result } = renderHook(() => useAdminProducts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    let uploadResult: any
    await act(async () => {
      uploadResult = await result.current.uploadImage(file)
    })
    expect(uploadResult).toHaveProperty('path', 'uploaded.jpg')
  })
})
