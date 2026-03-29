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
    expect(screen.getByTestId('product-price')).toBeInTheDocument()
  })

  it('renderiza el selector de talles desde el inicio', () => {
    renderInfo()
    expect(screen.getByTestId('size-panel')).toBeInTheDocument()
  })

  it('renderiza el botón agregar al carrito', () => {
    renderInfo()
    expect(screen.getByTestId('add-button')).toBeInTheDocument()
  })

  it('el botón agregar está deshabilitado sin talle seleccionado', () => {
    renderInfo()
    expect(screen.getByTestId('add-button')).toBeDisabled()
  })

  it('seleccionar un talle habilita el botón agregar', async () => {
    renderInfo()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('size-S'))
    expect(screen.getByTestId('add-button')).not.toBeDisabled()
  })

  it('al tocar el mismo talle dos veces lo deselecciona', async () => {
    renderInfo()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('size-S'))
    await user.click(screen.getByTestId('size-S'))
    expect(screen.getByTestId('add-button')).toBeDisabled()
  })

  it('muestra descripción si el producto la tiene', () => {
    renderInfo(productWithInfo)
    expect(screen.getByTestId('information-link')).toBeInTheDocument()
  })

  it('no muestra descripción si el producto no la tiene', () => {
    renderInfo(productWithoutInfo)
    expect(screen.queryByTestId('information-link')).not.toBeInTheDocument()
  })

  it('al seleccionar talla y agregar llama onAddToCart con producto y talla', async () => {
    const onAddToCart = vi.fn()
    renderInfo(productWithoutInfo, onAddToCart)
    const user = userEvent.setup()
    await user.click(screen.getByTestId('size-S'))
    await user.click(screen.getByTestId('add-button'))
    await waitFor(() => expect(onAddToCart).toHaveBeenCalledWith(productWithoutInfo, 'S'))
  })
})
