import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// matchMedia no está implementado en jsdom — lo mockeamos manualmente
function mockMatchMedia(matches: boolean) {
  const listeners: Array<() => void> = []
  const mq = {
    matches,
    addEventListener: vi.fn((_: string, cb: () => void) => listeners.push(cb)),
    removeEventListener: vi.fn(),
    _trigger: () => listeners.forEach((cb) => cb()),
  }
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn(() => mq),
  })
  return mq
}

import { useMediaQuery } from './useMediaQuery'

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('retorna true cuando el query matchea', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useMediaQuery('(min-width: 431px)'))
    expect(result.current).toBe(true)
  })

  it('retorna false cuando el query no matchea', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery('(min-width: 431px)'))
    expect(result.current).toBe(false)
  })

  it('se actualiza cuando cambia el viewport', () => {
    const mq = mockMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery('(min-width: 431px)'))
    expect(result.current).toBe(false)

    // Simular cambio de viewport actualizando matches y disparando listeners
    mq.matches = true
    act(() => mq._trigger())

    expect(result.current).toBe(true)
  })
})
