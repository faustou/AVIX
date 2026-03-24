import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductGrid } from './ProductGrid'
import { mockProducts } from '@/test/mocks/products'

const FOOTER_LINKS = ['contact', 'terms', 'privacy', 'accessibility', 'dnsmpi', 'cookies']

function renderGrid(overrides: Partial<Parameters<typeof ProductGrid>[0]> = {}) {
  const props = {
    products: mockProducts,
    onProductSelect: vi.fn(),
    columns: 3,
    ...overrides,
  }
  render(<ProductGrid {...props} />)
  return props
}

function getGrid() {
  return screen.getByTestId('product-grid')
}

describe('ProductGrid — Unit / Component', () => {
  it('renderiza todos los productos recibidos', () => {
    renderGrid()
    const cells = screen.getAllByTestId(/^grid-cell-/)
    expect(cells).toHaveLength(mockProducts.length)
  })

  it('cada producto muestra su código', () => {
    renderGrid()
    for (const product of mockProducts) {
      expect(screen.getByText(product.code)).toBeInTheDocument()
    }
  })

  it('con columns=3 el grid tiene data-columns="3"', () => {
    renderGrid({ columns: 3 })
    expect(getGrid()).toHaveAttribute('data-columns', '3')
  })

  it('con columns=2 el grid tiene data-columns="2"', () => {
    renderGrid({ columns: 2 })
    expect(getGrid()).toHaveAttribute('data-columns', '2')
  })

  it('con columns=1 el grid tiene data-columns="1"', () => {
    renderGrid({ columns: 1 })
    expect(getGrid()).toHaveAttribute('data-columns', '1')
  })

  it('al tocar un producto llama onProductSelect con el índice correcto', async () => {
    const { onProductSelect } = renderGrid()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('grid-cell-2'))
    expect(onProductSelect).toHaveBeenCalledOnce()
    expect(onProductSelect).toHaveBeenCalledWith(2)
  })

  it('el footer renderiza los 6 links legales', () => {
    renderGrid()
    for (const link of FOOTER_LINKS) {
      expect(screen.getByTestId(`footer-link-${link}`)).toBeInTheDocument()
    }
  })
})
