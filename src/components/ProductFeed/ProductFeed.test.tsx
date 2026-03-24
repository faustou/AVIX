import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductFeed } from './ProductFeed'
import { mockProducts } from '@/test/mocks/products'

function renderFeed(initialIndex = 0) {
  const onAddToCart = vi.fn()
  const onClose = vi.fn()
  render(
    <ProductFeed
      products={mockProducts}
      initialIndex={initialIndex}
      onAddToCart={onAddToCart}
      onClose={onClose}
    />,
  )
  return { onAddToCart, onClose }
}

function fireSwipeUp(el: Element) {
  fireEvent.touchStart(el, { touches: [{ clientX: 0, clientY: 300 }] })
  fireEvent.touchEnd(el, { changedTouches: [{ clientX: 0, clientY: 100 }] })
}

function fireSwipeDown(el: Element) {
  fireEvent.touchStart(el, { touches: [{ clientX: 0, clientY: 100 }] })
  fireEvent.touchEnd(el, { changedTouches: [{ clientX: 0, clientY: 300 }] })
}

describe('ProductFeed — Unit / Component', () => {
  it('renderiza el producto en el índice inicial correcto', () => {
    renderFeed(1)
    expect(screen.getByTestId('product-code')).toHaveTextContent('PK-01')
  })

  it('muestra código y precio del producto activo', () => {
    renderFeed(0)
    expect(screen.getByTestId('product-code')).toHaveTextContent('YS-01')
    expect(screen.getByTestId('product-price')).toHaveTextContent('$40')
  })

  it('el panel inferior muestra INFORMATION si el producto lo tiene', () => {
    renderFeed(1) // PK-01 tiene information
    expect(screen.getByTestId('information-link')).toBeInTheDocument()
  })

  it('el panel inferior no muestra INFORMATION si no aplica', () => {
    renderFeed(0) // YS-01 no tiene information
    expect(screen.queryByTestId('information-link')).not.toBeInTheDocument()
  })

  it('al tocar + abre el SizePanel', async () => {
    renderFeed(0)
    const user = userEvent.setup()
    await user.click(screen.getByTestId('add-button'))
    expect(screen.getByTestId('size-panel')).toBeInTheDocument()
  })
})

describe('ProductFeed — Swipe navigation', () => {
  it('al simular swipe up inicia la animación exit-up', () => {
    renderFeed(0)
    const feed = screen.getByTestId('product-feed')
    fireSwipeUp(feed)
    expect(screen.getByTestId('image-animation-wrapper')).toHaveAttribute('data-animation', 'exit-up')
  })

  it('no cambia si está en el primer producto y swipe down', () => {
    renderFeed(0)
    const feed = screen.getByTestId('product-feed')
    fireSwipeDown(feed)
    expect(screen.getByTestId('image-animation-wrapper')).toHaveAttribute('data-animation', 'idle')
  })

  it('no cambia si está en el último producto y swipe up', () => {
    renderFeed(mockProducts.length - 1)
    const feed = screen.getByTestId('product-feed')
    fireSwipeUp(feed)
    expect(screen.getByTestId('image-animation-wrapper')).toHaveAttribute('data-animation', 'idle')
  })

  it('al simular swipe down inicia la animación exit-down', () => {
    renderFeed(2)
    const feed = screen.getByTestId('product-feed')
    fireSwipeDown(feed)
    expect(screen.getByTestId('image-animation-wrapper')).toHaveAttribute('data-animation', 'exit-down')
  })

  it('tras exit-up + animationEnd actualiza al producto siguiente y pasa a enter-down', () => {
    renderFeed(0)
    const feed = screen.getByTestId('product-feed')
    fireSwipeUp(feed)
    const wrapper = screen.getByTestId('image-animation-wrapper')
    act(() => { wrapper.dispatchEvent(new Event('animationend')) })
    expect(wrapper).toHaveAttribute('data-animation', 'enter-down')
    expect(screen.getByTestId('product-code')).toHaveTextContent('PK-01')
  })

  it('tras enter-down + animationEnd vuelve a idle', () => {
    renderFeed(0)
    const feed = screen.getByTestId('product-feed')
    fireSwipeUp(feed)
    const wrapper = screen.getByTestId('image-animation-wrapper')
    act(() => { wrapper.dispatchEvent(new Event('animationend')) })
    act(() => { wrapper.dispatchEvent(new Event('animationend')) })
    expect(wrapper).toHaveAttribute('data-animation', 'idle')
  })
})
