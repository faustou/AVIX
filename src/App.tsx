import { useState } from 'react'
import styles from './App.module.css'
import { CartProvider, useCart } from '@/hooks/useCart'
import { useColumnCycle } from '@/hooks/useColumnCycle'
import { useProducts } from '@/hooks/useProducts'
import { Nav } from '@/components/Nav/Nav'
import { ProductGrid } from '@/components/Grid/ProductGrid'
import { ProductFeed } from '@/components/ProductFeed/ProductFeed'
import { Cart } from '@/components/Cart/Cart'
import type { Category } from '@/types'

function AppContent() {
  const { cartCount, addItem } = useCart()
  const { columns, cycle, direction } = useColumnCycle()
  const [activeCategory, setActiveCategory] = useState<Category>('new')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [showCart, setShowCart] = useState(false)

  const { products, loading, error } = useProducts(activeCategory)

  return (
    <div className={styles.app} data-testid="app">
      <Nav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        cartCount={cartCount}
        onCartClick={() => setShowCart(true)}
        showBack={selectedIndex !== null}
        onBackClick={() => setSelectedIndex(null)}
        dataOverlay={selectedIndex !== null}
        onCycle={cycle}
        columnDirection={direction}
      />

      {loading ? (
        <div className={styles.loading} data-testid="loading" />
      ) : error ? (
        <div className={styles.error} data-testid="error">
          ERROR AL CARGAR PRODUCTOS
        </div>
      ) : selectedIndex === null ? (
        <ProductGrid
          products={products}
          onProductSelect={(index) => setSelectedIndex(index)}
          columns={columns}
        />
      ) : (
        <ProductFeed
          products={products}
          initialIndex={selectedIndex}
          onAddToCart={addItem}
          onClose={() => setSelectedIndex(null)}
        />
      )}

      {showCart && <Cart onClose={() => setShowCart(false)} />}
    </div>
  )
}

export function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  )
}
