import { forwardRef, useRef, useState } from 'react'
import styles from './ProductFeedItem.module.css'
import { SizePanel } from '@/components/SizePanel/SizePanel'
import type { Product } from '@/types'

interface Props {
  product: Product
  isActive: boolean
  onAddToCart: (product: Product, size: string) => void
}

export const ProductFeedItem = forwardRef<HTMLDivElement, Props>(
  function ProductFeedItem({ product, isActive, onAddToCart }, ref) {
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const carouselRef = useRef<HTMLDivElement>(null)

    const sortedImages = [...product.product_images].sort(
      (a, b) => a.position - b.position,
    )

    function handleCarouselScroll() {
      const el = carouselRef.current
      if (!el) return
      const index = Math.round(el.scrollLeft / el.clientWidth)
      setActiveImageIndex(index)
    }

    return (
      <div
        ref={ref}
        className={styles.item}
        data-active={isActive ? 'true' : 'false'}
        data-testid="feed-item"
      >
        <div
          ref={carouselRef}
          className={styles.carousel}
          onScroll={handleCarouselScroll}
          data-testid="carousel"
        >
          {sortedImages.map((img) => (
            <img
              key={img.id}
              src={img.storage_path}
              alt={product.code}
              className={styles.carouselImage}
            />
          ))}
        </div>

        {sortedImages.length > 1 && (
          <div className={styles.dots} aria-hidden="true" data-testid="dots">
            {sortedImages.map((img, i) => (
              <span
                key={img.id}
                className={`${styles.dot} ${i === activeImageIndex ? styles.dotActive : ''}`}
              />
            ))}
          </div>
        )}

        <div className={styles.info}>
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
  },
)
