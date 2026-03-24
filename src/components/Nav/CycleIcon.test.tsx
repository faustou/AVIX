import { render, screen } from '@testing-library/react'
import { CycleIcon } from './CycleIcon'

function getLine1() { return screen.getByTestId('cycle-line-1') }
function getLine2() { return screen.getByTestId('cycle-line-2') }

describe('CycleIcon', () => {
  it('renderiza un SVG con 2 líneas', () => {
    render(<CycleIcon direction="in" />)
    expect(screen.getByTestId('cycle-icon')).toBeInTheDocument()
    expect(getLine1()).toBeInTheDocument()
    expect(getLine2()).toBeInTheDocument()
  })

  it('ambas líneas tienen atributos fijos x1=5 y1=12 x2=19 y2=12', () => {
    render(<CycleIcon direction="in" />)
    expect(getLine1()).toHaveAttribute('x1', '5')
    expect(getLine1()).toHaveAttribute('y1', '12')
    expect(getLine1()).toHaveAttribute('x2', '19')
    expect(getLine1()).toHaveAttribute('y2', '12')
    expect(getLine2()).toHaveAttribute('x1', '5')
    expect(getLine2()).toHaveAttribute('y1', '12')
    expect(getLine2()).toHaveAttribute('x2', '19')
    expect(getLine2()).toHaveAttribute('y2', '12')
  })

  it("direction='in' → línea 1 sin rotación, línea 2 rotada 90°", () => {
    render(<CycleIcon direction="in" />)
    expect(getLine1().style.transform).toBe('rotate(0deg)')
    expect(getLine2().style.transform).toBe('translate(12px, 12px) rotate(90deg) translate(-12px, -12px)')
  })

  it("direction='out' → líneas con transforms de diagonal desde el extremo izquierdo", () => {
    render(<CycleIcon direction="out" />)
    expect(getLine1().style.transform).toBe('translate(5px, 12px) rotate(-35deg) translate(-5px, -12px)')
    expect(getLine2().style.transform).toBe('translate(5px, 12px) rotate(35deg) translate(-5px, -12px)')
  })

  it('al cambiar direction el transform de línea 1 cambia', () => {
    const { rerender } = render(<CycleIcon direction="in" />)
    expect(getLine1().style.transform).toBe('rotate(0deg)')

    rerender(<CycleIcon direction="out" />)
    expect(getLine1().style.transform).toBe('translate(5px, 12px) rotate(-35deg) translate(-5px, -12px)')
  })
})
