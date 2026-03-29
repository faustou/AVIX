import { useState, useEffect } from 'react'
import { useMediaQuery } from './useMediaQuery'

const MOBILE_SEQUENCE  = [3, 2, 1] as const  // < 430px
const TABLET_SEQUENCE  = [4, 3, 2] as const  // 430–768px
const DESKTOP_SEQUENCE = [6, 4, 3] as const  // ≥ 768px

type Direction = 'in' | 'out'

export function useColumnCycle(isDesktop: boolean = false): {
  columns: number
  cycle: () => void
  direction: Direction
} {
  const isTablet  = useMediaQuery('(min-width: 430px)')
  const [index, setIndex] = useState(0)

  const sequence = isDesktop
    ? DESKTOP_SEQUENCE
    : isTablet
      ? TABLET_SEQUENCE
      : MOBILE_SEQUENCE

  // Reset index when breakpoint changes
  useEffect(() => {
    setIndex(0)
  }, [isDesktop, isTablet])

  const safeIndex = index % sequence.length
  const columns   = sequence[safeIndex]

  // 'in' = cycling toward fewer columns, 'out' = toward more
  const direction: Direction = safeIndex === 0 ? 'in' : 'out'

  function cycle() {
    setIndex((prev) => (prev + 1) % sequence.length)
  }

  return { columns, cycle, direction }
}
