import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductFeedInfo } from './ProductFeedInfo'
import { mockProducts } from '@/test/mocks/products'

const productWithInfo = mockProducts[1]    // PK-01 — has information
const productWithoutInfo = mockProducts[0] // YS-01 — no information

function renderInfo(product = productWithoutInfo, onAddToCart = vi.fn()) {
  render(<ProductFeedInfo product={product} onAddToCart={onAddToCart} />)
  return { onAddToCart }
}

describe('ProductFeedInfo', () => {
  it('renderiza código y precio del producto', () => {
    renderInfo()
    expect(screen.getByTestId('product-code')).toHaveTextContent('YS-01')
    expect(screen.getByTestId('product-price')).toHaveTextContent('$40')
  })

  it('renderiza el botón +', () => {
    renderInfo()
    expect(screen.getByTestId('add-button')).toBeInTheDocument()
  })

  it('al tocar + abre el SizePanel', async () => {
    renderInfo()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('add-button'))
    expect(screen.getByTestId('size-panel')).toBeInTheDocument()
  })

  it('muestra INFORMATION si el producto lo tiene', () => {
    renderInfo(productWithInfo)
    expect(screen.getByTestId('information-link')).toBeInTheDocument()
  })

  it('no muestra INFORMATION si el producto no lo tiene', () => {
    renderInfo(productWithoutInfo)
    expect(screen.queryByTestId('information-link')).not.toBeInTheDocument()
  })

  it('al seleccionar talla llama onAddToCart con producto y talla', async () => {
    const onAddToCart = vi.fn()
    renderInfo(productWithoutInfo, onAddToCart)
    const user = userEvent.setup()
    await user.click(screen.getByTestId('add-button'))
    await user.click(screen.getByTestId('size-S'))
    await waitFor(() => expect(onAddToCart).toHaveBeenCalledWith(productWithoutInfo, 'S'))
  })
})
