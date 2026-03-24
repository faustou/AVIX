import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'

vi.mock('@/hooks/useCheckout', () => ({
  useCheckout: () => ({ loading: false, error: null, startCheckout: vi.fn() }),
}))

import { Cart } from './Cart'
import { CartProvider, useCart } from '@/hooks/useCart'
import { mockProducts } from '@/test/mocks/products'

const p0 = mockProducts[0] // YS-01 — price: 40
const p1 = mockProducts[1] // PK-01 — price: 85

// Helper: renders Cart inside CartProvider and exposes addItem for pre-population
function renderCart(onClose = vi.fn()) {
  let addItemRef: ReturnType<typeof useCart>['addItem'] | null = null

  function Capture({ children }: { children: ReactNode }) {
    const { addItem } = useCart()
    addItemRef = addItem
    return <>{children}</>
  }

  render(
    <CartProvider>
      <Capture>
        <Cart onClose={onClose} />
      </Capture>
    </CartProvider>,
  )

  function addItem(product: typeof p0, size: string, qty = 1) {
    for (let i = 0; i < qty; i++) {
      act(() => addItemRef!(product, size))
    }
  }

  return { onClose, addItem }
}

describe('Cart', () => {
  it('renderiza ORDER SUMMARY', () => {
    renderCart()
    expect(screen.getByText('ORDER SUMMARY')).toBeInTheDocument()
  })

  it('muestra todos los items del carrito', () => {
    const { addItem } = renderCart()
    addItem(p0, 'S')
    addItem(p1, '7')
    expect(screen.getAllByTestId('cart-item')).toHaveLength(2)
  })

  it('muestra código, talla y precio de cada item', () => {
    const { addItem } = renderCart()
    addItem(p0, 'S')
    expect(screen.getByTestId('item-code')).toHaveTextContent('YS-01')
    expect(screen.getByTestId('item-size')).toHaveTextContent('S')
    expect(screen.getByTestId('item-price')).toHaveTextContent('$40')
  })

  it('muestra subtotal y total correctos', () => {
    const { addItem } = renderCart()
    addItem(p0, 'S', 2) // 40×2 = 80
    addItem(p1, '7', 1) // 85×1 = 85  → total 165
    expect(screen.getByTestId('subtotal')).toHaveTextContent('$165.00')
    expect(screen.getByTestId('total')).toHaveTextContent('$165.00')
  })

  it('al tocar + en un item incrementa quantity', async () => {
    const { addItem } = renderCart()
    addItem(p0, 'S')
    const user = userEvent.setup()
    await user.click(screen.getByTestId('qty-increase'))
    expect(screen.getByTestId('item-qty')).toHaveTextContent('2')
  })

  it('al tocar - en un item decrementa quantity', async () => {
    const { addItem } = renderCart()
    addItem(p0, 'S', 2) // qty = 2
    const user = userEvent.setup()
    await user.click(screen.getByTestId('qty-decrease'))
    expect(screen.getByTestId('item-qty')).toHaveTextContent('1')
  })

  it('al tocar - con quantity=1 elimina el item', async () => {
    const { addItem } = renderCart()
    addItem(p0, 'S') // qty = 1
    const user = userEvent.setup()
    await user.click(screen.getByTestId('qty-decrease'))
    expect(screen.queryByTestId('cart-item')).not.toBeInTheDocument()
  })

  it('renderiza botones Apple Pay y PayPal', () => {
    renderCart()
    expect(screen.getByTestId('apple-pay')).toBeInTheDocument()
    expect(screen.getByTestId('paypal')).toBeInTheDocument()
  })

  it('renderiza el input de email', () => {
    renderCart()
    expect(screen.getByTestId('checkout-email')).toBeInTheDocument()
  })

  it('al tocar ← llama onClose', async () => {
    const { onClose } = renderCart()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('cart-close'))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
