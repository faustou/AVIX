import { useState } from 'react'
import styles from './ProductFeedInfo.module.css'
import { SizePanel } from '@/components/SizePanel/SizePanel'
import type { Product } from '@/types'

interface Props {
  product: Product
  onAddToCart: (product: Product, size: string) => void
}

export function ProductFeedInfo({ product, onAddToCart }: Props) {
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  return (
    <div className={styles.infoZone} data-testid="feed-info">
      <div className={styles.content}>
        <span className={styles.code} data-testid="product-code">
          {product.code}
        </span>
        <span className={styles.price} data-testid="product-price">
          ${product.price}
        </span>
        <button
          className={styles.addButton}
          aria-label="Add to cart"
          data-testid="add-button"
          data-open={isPanelOpen ? 'true' : 'false'}
          onClick={() => setIsPanelOpen(true)}
        >
          +
        </button>
        {product.information && (
          <button className={styles.information} data-testid="information-link">
            INFORMATION
          </button>
        )}
      </div>

      <SizePanel
        product={product}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onAddToCart={onAddToCart}
      />
    </div>
  )
}
