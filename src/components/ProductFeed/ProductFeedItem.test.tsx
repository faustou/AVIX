import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { ProductFeedItem } from './ProductFeedItem'
import { mockProducts } from '@/test/mocks/products'

const product = mockProducts[0] // YS-01: S/M/L, no information

function renderItem(onAddToCart = vi.fn()) {
  const ref = createRef<HTMLDivElement>()
  render(
    <ProductFeedItem
      ref={ref}
      product={product}
      isActive={true}
      onAddToCart={onAddToCart}
    />,
  )
  return { onAddToCart }
}

describe('ProductFeedItem — Integration con SizePanel', () => {
  it('por defecto el SizePanel no está visible', () => {
    renderItem()
    expect(screen.queryByTestId('size-panel')).not.toBeInTheDocument()
  })

  it('al tocar + el SizePanel aparece con "SELECT SIZE"', async () => {
    renderItem()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('add-button'))
    expect(screen.getByTestId('size-panel')).toBeInTheDocument()
    expect(screen.getByTestId('panel-header')).toHaveTextContent('SELECT SIZE')
  })

  it('al tocar + el botón queda con data-open="true"', async () => {
    renderItem()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('add-button'))
    expect(screen.getByTestId('add-button')).toHaveAttribute('data-open', 'true')
  })

  it('al tocar × dentro del panel el panel se cierra', async () => {
    renderItem()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('add-button'))
    expect(screen.getByTestId('size-panel')).toBeInTheDocument()
    await user.click(screen.getByTestId('close-panel'))
    // El panel empieza animación de cierre — data-open cambia a false
    expect(screen.getByTestId('size-panel')).toHaveAttribute('data-open', 'false')
  })

  it('al seleccionar talla se llama onAddToCart con producto y talla', async () => {
    const onAddToCart = vi.fn()
    renderItem(onAddToCart)
    const user = userEvent.setup()
    await user.click(screen.getByTestId('add-button'))
    await user.click(screen.getByTestId('size-S'))
    await waitFor(() => expect(onAddToCart).toHaveBeenCalledWith(product, 'S'))
  })
})
