import { renderHook, act } from '@testing-library/react'
import { useColumnCycle } from './useColumnCycle'

describe('useColumnCycle', () => {
  it('estado inicial es 3 columnas', () => {
    const { result } = renderHook(() => useColumnCycle())
    expect(result.current.columns).toBe(3)
  })

  it('primer ciclo: 3 → 2', () => {
    const { result } = renderHook(() => useColumnCycle())
    act(() => result.current.cycle())
    expect(result.current.columns).toBe(2)
  })

  it('segundo ciclo: 2 → 1', () => {
    const { result } = renderHook(() => useColumnCycle())
    act(() => result.current.cycle())
    act(() => result.current.cycle())
    expect(result.current.columns).toBe(1)
  })

  it('tercer ciclo: 1 → 2 (rebote, no salta a 3)', () => {
    const { result } = renderHook(() => useColumnCycle())
    act(() => result.current.cycle())
    act(() => result.current.cycle())
    act(() => result.current.cycle())
    expect(result.current.columns).toBe(2)
  })

  it('cuarto ciclo: 2 → 3', () => {
    const { result } = renderHook(() => useColumnCycle())
    act(() => result.current.cycle())
    act(() => result.current.cycle())
    act(() => result.current.cycle())
    act(() => result.current.cycle())
    expect(result.current.columns).toBe(3)
  })

  it('quinto ciclo: 3 → 2 (vuelve a bajar)', () => {
    const { result } = renderHook(() => useColumnCycle())
    act(() => result.current.cycle())
    act(() => result.current.cycle())
    act(() => result.current.cycle())
    act(() => result.current.cycle())
    act(() => result.current.cycle())
    expect(result.current.columns).toBe(2)
  })

  it("direction='in' cuando columns=3 (índice 0)", () => {
    const { result } = renderHook(() => useColumnCycle())
    expect(result.current.direction).toBe('in')
  })

  it("direction='in' cuando columns=2 yendo a 1 (índice 1)", () => {
    const { result } = renderHook(() => useColumnCycle())
    act(() => result.current.cycle())
    expect(result.current.direction).toBe('in')
  })

  it("direction='out' cuando columns=1 (índice 2)", () => {
    const { result } = renderHook(() => useColumnCycle())
    act(() => result.current.cycle())
    act(() => result.current.cycle())
    expect(result.current.direction).toBe('out')
  })

  it("direction='out' cuando columns=2 yendo a 3 (índice 3)", () => {
    const { result } = renderHook(() => useColumnCycle())
    act(() => result.current.cycle())
    act(() => result.current.cycle())
    act(() => result.current.cycle())
    expect(result.current.direction).toBe('out')
  })
})
