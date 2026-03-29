import styles from './ProductGrid.module.css'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  onProductSelect: (index: number) => void
  columns: number
}


export function ProductGrid({ products, onProductSelect, columns }: ProductGridProps) {
  return (
    <div className={styles.wrapper}>
      <div
        className={styles.grid}
        data-columns={columns}
        data-testid="product-grid"
      >
        {products.map((product, i) => {
          const sorted = [...product.product_images].sort((a, b) => a.position - b.position)
          const primary = sorted[0]
          const secondary = sorted[1]
          return (
            <button
              key={product.id}
              className={styles.cell}
              onClick={() => onProductSelect(i)}
              data-testid={`grid-cell-${i}`}
            >
              <div className={styles.imageWrapper}>
                {primary && (
                  <img
                    src={primary.storage_path}
                    alt={product.code}
                    className={styles.imagePrimary}
                  />
                )}
                {secondary && (
                  <img
                    src={secondary.storage_path}
                    alt=""
                    className={styles.imageSecondary}
                  />
                )}
              </div>
              <span className={styles.code} data-testid={`product-code-${i}`}>
                {product.code}
              </span>
              <div className={styles.priceRow}>
                {product.discount_price ? (
                  <>
                    <span className={styles.priceOriginal}>
                      ${product.price.toLocaleString('es-AR')}
                    </span>
                    <span className={styles.priceDiscount}>
                      ${product.discount_price.toLocaleString('es-AR')}
                    </span>
                  </>
                ) : (
                  <span className={styles.price}>
                    ${product.price.toLocaleString('es-AR')}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

    </div>
  )
}
