import { useState } from 'react'

const SEQUENCE = [3, 2, 1, 2] as const
type Columns = (typeof SEQUENCE)[number]
type Direction = 'in' | 'out'

export function useColumnCycle() {
  const [index, setIndex] = useState(0)

  const columns: Columns = SEQUENCE[index]
  const direction: Direction = index < 2 ? 'in' : 'out'

  function cycle() {
    setIndex((prev) => (prev + 1) % SEQUENCE.length)
  }

  return { columns, cycle, direction }
}
