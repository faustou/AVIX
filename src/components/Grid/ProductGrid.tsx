import styles from './ProductGrid.module.css'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  onProductSelect: (index: number) => void
  columns: number
}

const FOOTER_LINKS = ['CONTACT', 'TERMS', 'PRIVACY', 'ACCESSIBILITY', 'DNSMPI', 'COOKIES']

export function ProductGrid({ products, onProductSelect, columns }: ProductGridProps) {
  return (
    <div className={styles.wrapper}>
      <div
        className={styles.grid}
        data-columns={columns}
        data-testid="product-grid"
      >
        {products.map((product, i) => {
          const firstImage = [...product.product_images].sort(
            (a, b) => a.position - b.position,
          )[0]
          return (
            <button
              key={product.id}
              className={styles.cell}
              onClick={() => onProductSelect(i)}
              data-testid={`grid-cell-${i}`}
            >
              {firstImage && (
                <img
                  src={firstImage.storage_path}
                  alt={product.code}
                  className={styles.image}
                />
              )}
              <span className={styles.code} data-testid={`product-code-${i}`}>
                {product.code}
              </span>
            </button>
          )
        })}
      </div>

      <footer className={styles.footer} data-testid="grid-footer">
        <nav aria-label="Legal links">
          {FOOTER_LINKS.map((link, i) => (
            <span key={link}>
              {i > 0 && <span className={styles.separator}> · </span>}
              <span className={styles.footerLink} data-testid={`footer-link-${link.toLowerCase()}`}>
                {link}
              </span>
            </span>
          ))}
        </nav>
      </footer>
    </div>
  )
}
