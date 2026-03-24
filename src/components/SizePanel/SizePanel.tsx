import { useEffect, useRef, useState } from 'react'
import styles from './SizePanel.module.css'
import type { Product, ProductSize } from '@/types'

interface SizePanelProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product, size: string) => void
}

export function SizePanel({ product, isOpen, onClose, onAddToCart }: SizePanelProps) {
  const [isVisible, setIsVisible] = useState(isOpen)
  const [sizeDisplay, setSizeDisplay] = useState<'primary' | 'secondary'>('primary')
  const [isAdding, setIsAdding] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isOpen) setIsVisible(true)
  }, [isOpen])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleAnimationEnd() {
    if (!isOpen) setIsVisible(false)
  }

  function getSizeLabel(ps: ProductSize): string {
    if (product.size_system === 'us_eu' && sizeDisplay === 'secondary' && ps.size_eu) {
      return ps.size_eu
    }
    return ps.size_us ?? ps.size_eu ?? ''
  }

  function handleSizeSelect(size: string) {
    setIsAdding(true)
    timerRef.current = setTimeout(() => {
      onAddToCart(product, size)
      onClose()
    }, 300)
  }

  const hasToggle = product.size_system === 'us_eu'

  if (!isVisible) return null

  return (
    <div
      className={styles.panel}
      data-open={isOpen ? 'true' : 'false'}
      onAnimationEnd={handleAnimationEnd}
      data-testid="size-panel"
    >
      <div className={styles.header}>
        {hasToggle ? (
          <button
            className={styles.headerButton}
            onClick={() =>
              setSizeDisplay((d) => (d === 'primary' ? 'secondary' : 'primary'))
            }
            aria-label="Toggle size system"
            data-testid="toggle-system"
          >
            ?
          </button>
        ) : (
          <span className={styles.headerPlaceholder} />
        )}

        <span className={styles.headerTitle} data-testid="panel-header">
          {isAdding ? 'ADDING' : 'SELECT SIZE'}
        </span>

        <button
          className={styles.headerButton}
          onClick={onClose}
          aria-label="Close size panel"
          data-testid="close-panel"
        >
          ×
        </button>
      </div>

      <div className={styles.price}>${product.price}</div>

      <div className={styles.sizes}>
        {product.product_sizes.map((ps) => {
          const label = getSizeLabel(ps)
          return (
            <button
              key={ps.id}
              className={styles.size}
              disabled={(ps.stock ?? 0) <= 0}
              onClick={() => handleSizeSelect(label)}
              data-testid={`size-${label}`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
