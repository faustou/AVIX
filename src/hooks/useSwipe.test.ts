import { renderHook } from '@testing-library/react'
import { useSwipe } from './useSwipe'

function makeTouch(x: number, y: number): Touch {
  return { clientX: x, clientY: y } as Touch
}

function makeTouchStart(x: number, y: number): React.TouchEvent {
  return { touches: [makeTouch(x, y)] } as unknown as React.TouchEvent
}

function makeTouchEnd(x: number, y: number): React.TouchEvent {
  return { changedTouches: [makeTouch(x, y)] } as unknown as React.TouchEvent
}

describe('useSwipe', () => {
  it('no dispara nada si el movimiento es menor a 50px', () => {
    const onSwipeUp = vi.fn()
    const onSwipeDown = vi.fn()
    const { result } = renderHook(() => useSwipe(onSwipeUp, onSwipeDown))

    result.current.onTouchStart(makeTouchStart(0, 200))
    result.current.onTouchEnd(makeTouchEnd(0, 170)) // 30px up

    expect(onSwipeUp).not.toHaveBeenCalled()
    expect(onSwipeDown).not.toHaveBeenCalled()
  })

  it('dispara onSwipeUp con movimiento vertical > 50px hacia arriba', () => {
    const onSwipeUp = vi.fn()
    const onSwipeDown = vi.fn()
    const { result } = renderHook(() => useSwipe(onSwipeUp, onSwipeDown))

    result.current.onTouchStart(makeTouchStart(0, 300))
    result.current.onTouchEnd(makeTouchEnd(0, 200)) // 100px up

    expect(onSwipeUp).toHaveBeenCalledOnce()
    expect(onSwipeDown).not.toHaveBeenCalled()
  })

  it('dispara onSwipeDown con movimiento vertical > 50px hacia abajo', () => {
    const onSwipeUp = vi.fn()
    const onSwipeDown = vi.fn()
    const { result } = renderHook(() => useSwipe(onSwipeUp, onSwipeDown))

    result.current.onTouchStart(makeTouchStart(0, 100))
    result.current.onTouchEnd(makeTouchEnd(0, 200)) // 100px down

    expect(onSwipeDown).toHaveBeenCalledOnce()
    expect(onSwipeUp).not.toHaveBeenCalled()
  })

  it('no dispara si el swipe es principalmente horizontal', () => {
    const onSwipeUp = vi.fn()
    const onSwipeDown = vi.fn()
    const { result } = renderHook(() => useSwipe(onSwipeUp, onSwipeDown))

    result.current.onTouchStart(makeTouchStart(100, 100))
    result.current.onTouchEnd(makeTouchEnd(250, 140)) // 150px horizontal, 40px vertical

    expect(onSwipeUp).not.toHaveBeenCalled()
    expect(onSwipeDown).not.toHaveBeenCalled()
  })
})
