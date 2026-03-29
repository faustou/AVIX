import { useRef, useState } from 'react'
import styles from './ProductFeedInfo.module.css'
import { numToLetter } from '@/lib/sizes'
import type { Product, ProductSize } from '@/types'

interface Props {
  product: Product
  onAddToCart: (product: Product, size: string) => void
}

export function ProductFeedInfo({ product, onAddToCart }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalStock = product.product_sizes.reduce(
    (sum, ps) => sum + (ps.stock ?? 0),
    0,
  )

  function getSizeLabel(ps: ProductSize): string {
    if (product.size_system === 'letter' && ps.size_us) {
      return numToLetter(ps.size_us)
    }
    return ps.size_us ?? ps.size_eu ?? ''
  }

  function handleSizeSelect(size: string) {
    setSelectedSize((prev) => (prev === size ? null : size))
  }

  function handleAddToCart() {
    if (!selectedSize || isAdding) return
    setIsAdding(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onAddToCart(product, selectedSize)
      setSelectedSize(null)
      setIsAdding(false)
    }, 400)
  }

  return (
    <div className={styles.infoZone} data-testid="feed-info">
      <div className={styles.scroll}>

        {/* Nombre */}
        <span className={styles.code} data-testid="product-code">
          {product.code}
        </span>

        {/* Precio */}
        <div className={styles.priceRow} data-testid="product-price">
          {product.discount_price ? (
            <>
              <span className={styles.priceOriginal}>
                ${product.price.toLocaleString('es-AR')}
              </span>
              <span className={styles.price}>
                ${product.discount_price.toLocaleString('es-AR')}
              </span>
            </>
          ) : (
            <span className={styles.price}>
              ${product.price.toLocaleString('es-AR')}
            </span>
          )}
        </div>

        {/* Stock */}
        {totalStock > 0 && (
          <span className={styles.stock}> Ultimas {totalStock} en stock 🔥</span>
        )}

        {/* Talles */}
        <div className={styles.talleRow}>
          <span className={styles.talleLabel}>TALLE</span>
          <div className={styles.sizes} data-testid="size-panel">
            {product.product_sizes.map((ps) => {
              const label = getSizeLabel(ps)
              const unavailable = (ps.stock ?? 0) <= 0
              return (
                <button
                  key={ps.id}
                  className={`${styles.sizeBtn} ${selectedSize === label ? styles.sizeBtnActive : ''}`}
                  disabled={unavailable || isAdding}
                  onClick={() => handleSizeSelect(label)}
                  data-testid={`size-${label}`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Agregar al carrito */}
        <button
          className={`${styles.addBtn} ${selectedSize ? styles.addBtnActive : ''}`}
          onClick={handleAddToCart}
          disabled={!selectedSize || isAdding}
          data-testid="add-button"
        >
          {isAdding ? 'AGREGANDO...' : 'AGREGAR AL CARRITO'}
        </button>

        {/* Descripción */}
        {product.information && (
          <p className={styles.infoText} data-testid="information-link">
            {product.information}
          </p>
        )}

      </div>

    </div>
  )
}
