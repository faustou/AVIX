import { useRef } from 'react'
import type { TouchEvent } from 'react'

interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void
  onTouchEnd: (e: TouchEvent) => void
}

export function useSwipe(onSwipeUp: () => void, onSwipeDown: () => void): SwipeHandlers {
  const startY = useRef<number | null>(null)
  const startX = useRef<number | null>(null)

  function onTouchStart(e: TouchEvent) {
    startY.current = e.touches[0].clientY
    startX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: TouchEvent) {
    if (startY.current === null || startX.current === null) return

    const deltaY = startY.current - e.changedTouches[0].clientY
    const deltaX = Math.abs(startX.current - e.changedTouches[0].clientX)

    startY.current = null
    startX.current = null

    // Ignore if mainly horizontal
    if (deltaX > Math.abs(deltaY)) return
    // Ignore if below threshold
    if (Math.abs(deltaY) < 50) return

    if (deltaY > 0) {
      onSwipeUp()
    } else {
      onSwipeDown()
    }
  }

  return { onTouchStart, onTouchEnd }
}
