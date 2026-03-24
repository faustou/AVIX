import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'
import { mockProducts } from '@/test/mocks/products'

const mockUseProducts = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useProducts', () => ({
  useProducts: mockUseProducts,
}))

// ProductFeed requires scrollIntoView and IntersectionObserver
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()

  class MockIntersectionObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    constructor(_cb: IntersectionObserverCallback) {}
  }
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

beforeEach(() => {
  mockUseProducts.mockReturnValue({ products: mockProducts, loading: false, error: null })
})

function renderApp() {
  render(<App />)
}

describe('App', () => {
  it('renderiza el Nav siempre', () => {
    renderApp()
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })

  it('por defecto muestra el ProductGrid, no el ProductFeed', () => {
    renderApp()
    expect(screen.getByTestId('product-grid')).toBeInTheDocument()
    expect(screen.queryByTestId('product-feed')).not.toBeInTheDocument()
  })

  it('el Nav recibe showBack=false en vista grid (no hay botón ←)', () => {
    renderApp()
    expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()
  })

  it('al tocar un producto se monta el ProductFeed y se desmonta el Grid', async () => {
    renderApp()
    const user = userEvent.setup()
    await act(async () => {
      await user.click(screen.getByTestId('grid-cell-0'))
    })
    expect(screen.getByTestId('product-feed')).toBeInTheDocument()
    expect(screen.queryByTestId('product-grid')).not.toBeInTheDocument()
  })

  it('el Nav recibe showBack=true en vista feed (hay botón ←)', async () => {
    renderApp()
    const user = userEvent.setup()
    await act(async () => {
      await user.click(screen.getByTestId('grid-cell-0'))
    })
    expect(screen.getByTestId('back-button')).toBeInTheDocument()
  })

  it('al tocar ← en el Nav vuelve al ProductGrid', async () => {
    renderApp()
    const user = userEvent.setup()
    await act(async () => {
      await user.click(screen.getByTestId('grid-cell-0'))
    })
    await act(async () => {
      await user.click(screen.getByTestId('back-button'))
    })
    expect(screen.getByTestId('product-grid')).toBeInTheDocument()
    expect(screen.queryByTestId('product-feed')).not.toBeInTheDocument()
  })

  it('al tocar el ícono del carrito se muestra el Cart', async () => {
    renderApp()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('cart-button'))
    expect(screen.getByTestId('cart')).toBeInTheDocument()
  })

  it('el cartCount en Nav refleja los items reales tras agregar un producto', async () => {
    renderApp()
    const user = userEvent.setup()
    // Open product feed
    await act(async () => { await user.click(screen.getByTestId('grid-cell-0')) })
    // Open size panel on the first item
    await user.click(screen.getByTestId('add-button'))
    // Select size S (YS-01)
    await user.click(screen.getByTestId('size-S'))
    // Wait for the 300ms ADDING timer to fire and cartCount to update
    await waitFor(() => expect(screen.getByTestId('cart-count')).toHaveTextContent('1'))
  })

  it('al llamar onClose del ProductFeed vuelve al ProductGrid (mismo efecto que back)', async () => {
    renderApp()
    const user = userEvent.setup()
    // Abrir feed
    await act(async () => {
      await user.click(screen.getByTestId('grid-cell-1'))
    })
    expect(screen.getByTestId('product-feed')).toBeInTheDocument()
    // onClose = misma función que onBackClick → back button
    await act(async () => {
      await user.click(screen.getByTestId('back-button'))
    })
    expect(screen.getByTestId('product-grid')).toBeInTheDocument()
  })

  it('muestra estado de carga mientras loading=true', () => {
    mockUseProducts.mockReturnValue({ products: [], loading: true, error: null })
    renderApp()
    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(screen.queryByTestId('product-grid')).not.toBeInTheDocument()
  })

  it('muestra mensaje de error si error !== null', () => {
    mockUseProducts.mockReturnValue({ products: [], loading: false, error: 'Network error' })
    renderApp()
    expect(screen.getByTestId('error')).toBeInTheDocument()
    expect(screen.queryByTestId('product-grid')).not.toBeInTheDocument()
  })
})
