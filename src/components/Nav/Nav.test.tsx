import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Nav } from './Nav'
import type { Category } from '@/types'

const CATEGORIES: Category[] = ['new', 'mens', 'womens', 'slides', 'accessories']

const BASE_PROPS = {
  activeCategory: 'new' as Category,
  onCategoryChange: vi.fn(),
  cartCount: 0,
  onCartClick: vi.fn(),
  showBack: false,
  onBackClick: vi.fn(),
}

function renderNav(overrides: Partial<Parameters<typeof Nav>[0]> = {}) {
  const props = { ...BASE_PROPS, ...overrides }
  const { rerender } = render(<Nav {...props} />)
  return { ...props, rerender }
}

describe('Nav', () => {
  it('renderiza las 5 categorías', () => {
    renderNav()
    for (const cat of CATEGORIES) {
      expect(screen.getByTestId(`category-${cat}`)).toBeInTheDocument()
    }
  })

  it('la categoría activa tiene data-active="true" y las demás "false"', () => {
    renderNav({ activeCategory: 'slides' })
    expect(screen.getByTestId('category-slides')).toHaveAttribute('data-active', 'true')
    for (const cat of CATEGORIES.filter((c) => c !== 'slides')) {
      expect(screen.getByTestId(`category-${cat}`)).toHaveAttribute('data-active', 'false')
    }
  })

  it('al tocar una categoría llama onCategoryChange con el slug correcto', async () => {
    const { onCategoryChange } = renderNav({ activeCategory: 'new' })
    const user = userEvent.setup()
    await user.click(screen.getByTestId('category-womens'))
    expect(onCategoryChange).toHaveBeenCalledOnce()
    expect(onCategoryChange).toHaveBeenCalledWith('womens')
  })

  it('si cartCount > 0 muestra el número junto al carrito', () => {
    renderNav({ cartCount: 3 })
    expect(screen.getByTestId('cart-count')).toHaveTextContent('3')
  })

  it('si cartCount === 0 no muestra el número', () => {
    renderNav({ cartCount: 0 })
    expect(screen.queryByTestId('cart-count')).not.toBeInTheDocument()
  })

  it('si showBack === true muestra el botón ←', () => {
    renderNav({ showBack: true })
    expect(screen.getByTestId('back-button')).toBeInTheDocument()
  })

  it('si showBack === false no muestra el botón ←', () => {
    renderNav({ showBack: false })
    expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()
  })

  it('al tocar el carrito llama onCartClick', async () => {
    const { onCartClick } = renderNav()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('cart-button'))
    expect(onCartClick).toHaveBeenCalledOnce()
  })

  it('al tocar ← llama onBackClick', async () => {
    const { onBackClick } = renderNav({ showBack: true })
    const user = userEvent.setup()
    await user.click(screen.getByTestId('back-button'))
    expect(onBackClick).toHaveBeenCalledOnce()
  })

  it('sin dataOverlay el nav tiene data-overlay="false"', () => {
    renderNav()
    expect(screen.getByRole('navigation')).toHaveAttribute('data-overlay', 'false')
  })

  it('con dataOverlay=true el nav tiene data-overlay="true"', () => {
    renderNav({ dataOverlay: true })
    expect(screen.getByRole('navigation')).toHaveAttribute('data-overlay', 'true')
  })

  it('en modo grid muestra el botón de ciclo', () => {
    renderNav({ showBack: false, onCycle: vi.fn(), columnDirection: 'in' })
    expect(screen.getByTestId('cycle-button')).toBeInTheDocument()
  })

  it('en modo feed no muestra el botón de ciclo sino ←', () => {
    renderNav({ showBack: true })
    expect(screen.queryByTestId('cycle-button')).not.toBeInTheDocument()
    expect(screen.getByTestId('back-button')).toBeInTheDocument()
  })

  it('al tocar el botón de ciclo llama onCycle', async () => {
    const onCycle = vi.fn()
    renderNav({ showBack: false, onCycle, columnDirection: 'in' })
    const user = userEvent.setup()
    await user.click(screen.getByTestId('cycle-button'))
    expect(onCycle).toHaveBeenCalledOnce()
  })

  it('el botón de ciclo renderiza un SVG con líneas animadas', () => {
    renderNav({ showBack: false, onCycle: vi.fn(), columnDirection: 'in' })
    const btn = screen.getByTestId('cycle-button')
    expect(btn.querySelector('svg')).toBeInTheDocument()
    expect(btn.querySelector('line')).toBeInTheDocument()
  })
})
