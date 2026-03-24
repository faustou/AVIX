import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SizePanel } from './SizePanel'
import { mockProducts } from '@/test/mocks/products'

// mockProducts[0] = YS-01: size_system 'us_eu', sizes S/M/L (size_eu null)
// mockProducts[1] = PK-01: size_system 'us_eu', sizes 7/8/9 (size_eu 40/41/42)
const productNoEu = mockProducts[0]  // YS-01
const productWithEu = mockProducts[1] // PK-01

function renderPanel(props: Partial<Parameters<typeof SizePanel>[0]> = {}) {
  const defaults = {
    product: productNoEu,
    isOpen: true,
    onClose: vi.fn(),
    onAddToCart: vi.fn(),
  }
  render(<SizePanel {...defaults} {...props} />)
  return { ...defaults, ...props }
}

describe('SizePanel — Unit / Component', () => {
  it('no renderiza nada cuando isOpen=false', () => {
    renderPanel({ isOpen: false })
    expect(screen.queryByTestId('size-panel')).not.toBeInTheDocument()
  })

  it('renderiza "SELECT SIZE" cuando isOpen=true', () => {
    renderPanel({ isOpen: true })
    expect(screen.getByTestId('panel-header')).toHaveTextContent('SELECT SIZE')
  })

  it('renderiza todos los talles del producto', () => {
    renderPanel({ product: productNoEu })
    // YS-01 tiene 3 tallas: S, M, L
    expect(screen.getByTestId('size-S')).toBeInTheDocument()
    expect(screen.getByTestId('size-M')).toBeInTheDocument()
    expect(screen.getByTestId('size-L')).toBeInTheDocument()
  })

  it('muestra talles en sistema primary (size_us) por defecto', () => {
    renderPanel({ product: productWithEu })
    // PK-01 primary: 7, 8, 9
    expect(screen.getByTestId('size-7')).toBeInTheDocument()
    expect(screen.getByTestId('size-8')).toBeInTheDocument()
    expect(screen.getByTestId('size-9')).toBeInTheDocument()
    expect(screen.queryByTestId('size-40')).not.toBeInTheDocument()
  })

  it('al tocar ? alterna al sistema secondary (size_eu)', async () => {
    renderPanel({ product: productWithEu })
    const user = userEvent.setup()
    await user.click(screen.getByTestId('toggle-system'))
    // Secondary: 40, 41, 42
    expect(screen.getByTestId('size-40')).toBeInTheDocument()
    expect(screen.getByTestId('size-41')).toBeInTheDocument()
    expect(screen.queryByTestId('size-7')).not.toBeInTheDocument()
  })

  it('al tocar × llama onClose', async () => {
    const onClose = vi.fn()
    renderPanel({ onClose })
    const user = userEvent.setup()
    await user.click(screen.getByTestId('close-panel'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('al tocar un talle muestra "ADDING" brevemente', async () => {
    // "ADDING" es síncrono (setIsAdding se llama antes del setTimeout)
    // Se verifica inmediatamente tras el click, dentro de la ventana de 300ms
    renderPanel({ product: productNoEu })
    const user = userEvent.setup()
    await user.click(screen.getByTestId('size-S'))
    expect(screen.getByTestId('panel-header')).toHaveTextContent('ADDING')
  })

  it('después de "ADDING" llama onAddToCart con el producto y la talla seleccionada', async () => {
    const onAddToCart = vi.fn()
    const onClose = vi.fn()
    renderPanel({ product: productNoEu, onAddToCart, onClose })
    const user = userEvent.setup()
    await user.click(screen.getByTestId('size-M'))
    await waitFor(() => expect(onAddToCart).toHaveBeenCalledWith(productNoEu, 'M'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('los talles sin stock aparecen deshabilitados', () => {
    renderPanel({ product: productNoEu })
    // YS-01: L tiene in_stock: false
    expect(screen.getByTestId('size-L')).toBeDisabled()
    expect(screen.getByTestId('size-S')).not.toBeDisabled()
  })
})
