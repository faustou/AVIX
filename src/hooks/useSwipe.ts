import { useRef } from 'react'
import type { TouchEvent, WheelEvent, MouseEvent } from 'react'

interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void
  onTouchEnd: (e: TouchEvent) => void
  onWheel: (e: WheelEvent) => void
  onMouseDown: (e: MouseEvent) => void
  onMouseUp: (e: MouseEvent) => void
}

export function useSwipe(onSwipeUp: () => void, onSwipeDown: () => void): SwipeHandlers {
  const startY = useRef<number | null>(null)
  const startX = useRef<number | null>(null)
  const mouseStartY = useRef<number | null>(null)
  const wheelBlocked = useRef(false)

  // ── Touch ──
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

    if (deltaX > Math.abs(deltaY)) return
    if (Math.abs(deltaY) < 50) return

    if (deltaY > 0) onSwipeUp()
    else onSwipeDown()
  }

  // ── Mouse wheel ──
  function onWheel(e: WheelEvent) {
    if (wheelBlocked.current) return
    if (Math.abs(e.deltaY) < 30) return

    wheelBlocked.current = true
    setTimeout(() => { wheelBlocked.current = false }, 700)

    if (e.deltaY > 0) onSwipeUp()
    else onSwipeDown()
  }

  // ── Mouse drag ──
  function onMouseDown(e: MouseEvent) {
    mouseStartY.current = e.clientY
  }

  function onMouseUp(e: MouseEvent) {
    if (mouseStartY.current === null) return
    const deltaY = mouseStartY.current - e.clientY
    mouseStartY.current = null

    if (Math.abs(deltaY) < 50) return

    if (deltaY > 0) onSwipeUp()
    else onSwipeDown()
  }

  return { onTouchStart, onTouchEnd, onWheel, onMouseDown, onMouseUp }
}
