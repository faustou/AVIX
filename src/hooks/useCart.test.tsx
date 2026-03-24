import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { CartProvider, useCart } from './useCart'
import { mockProducts } from '@/test/mocks/products'

const p0 = mockProducts[0] // YS-01 — price: 40
const p1 = mockProducts[1] // PK-01 — price: 85

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>
}

function renderCartHook() {
  return renderHook(() => useCart(), { wrapper })
}

describe('useCart', () => {
  it('estado inicial: items vacío, cartCount 0, subtotal 0', () => {
    const { result } = renderCartHook()
    expect(result.current.items).toEqual([])
    expect(result.current.cartCount).toBe(0)
    expect(result.current.subtotal).toBe(0)
    expect(result.current.total).toBe(0)
  })

  it('addItem agrega un item correctamente', () => {
    const { result } = renderCartHook()
    act(() => result.current.addItem(p0, 'S'))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0]).toMatchObject({ product: p0, size: 'S', quantity: 1 })
  })

  it('addItem con mismo producto+talla incrementa quantity', () => {
    const { result } = renderCartHook()
    act(() => result.current.addItem(p0, 'S'))
    act(() => result.current.addItem(p0, 'S'))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(2)
  })

  it('addItem con mismo producto pero distinta talla agrega item nuevo', () => {
    const { result } = renderCartHook()
    act(() => result.current.addItem(p0, 'S'))
    act(() => result.current.addItem(p0, 'M'))
    expect(result.current.items).toHaveLength(2)
  })

  it('updateQuantity modifica la cantidad correctamente', () => {
    const { result } = renderCartHook()
    act(() => result.current.addItem(p0, 'S'))
    act(() => result.current.updateQuantity(p0.id, 'S', 5))
    expect(result.current.items[0].quantity).toBe(5)
  })

  it('updateQuantity con qty=0 elimina el item', () => {
    const { result } = renderCartHook()
    act(() => result.current.addItem(p0, 'S'))
    act(() => result.current.updateQuantity(p0.id, 'S', 0))
    expect(result.current.items).toHaveLength(0)
  })

  it('removeItem elimina el item correcto sin afectar otros', () => {
    const { result } = renderCartHook()
    act(() => result.current.addItem(p0, 'S'))
    act(() => result.current.addItem(p1, '7'))
    act(() => result.current.removeItem(p0.id, 'S'))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].product.id).toBe(p1.id)
  })

  it('clearCart vacía todos los items', () => {
    const { result } = renderCartHook()
    act(() => result.current.addItem(p0, 'S'))
    act(() => result.current.addItem(p1, '7'))
    act(() => result.current.clearCart())
    expect(result.current.items).toHaveLength(0)
  })

  it('cartCount suma correctamente con múltiples items', () => {
    const { result } = renderCartHook()
    act(() => result.current.addItem(p0, 'S'))
    act(() => result.current.addItem(p0, 'S')) // qty=2
    act(() => result.current.addItem(p1, '7')) // qty=1
    expect(result.current.cartCount).toBe(3)
  })

  it('subtotal calcula correctamente (precio × qty por item)', () => {
    const { result } = renderCartHook()
    act(() => result.current.addItem(p0, 'S'))   // 40 × 1 = 40
    act(() => result.current.addItem(p0, 'S'))   // 40 × 2 = 80
    act(() => result.current.addItem(p1, '7'))   // 85 × 1 = 85
    expect(result.current.subtotal).toBe(165)    // 80 + 85
    expect(result.current.total).toBe(165)
  })
})
