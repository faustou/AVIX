import { useState } from 'react'
import { useAdminProducts } from '@/hooks/useAdminProducts'
import { ProductForm } from './ProductForm'
import type { Product, ProductFormData } from '@/types'
import styles from './AdminProductos.module.css'

export function AdminProductos() {
  const { products, loading, error, createProduct, updateProduct, togglePublished, uploadImage } =
    useAdminProducts()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)

  function handleNew() {
    setEditingProduct(null)
    setShowForm(true)
  }

  function handleEdit(product: Product) {
    setEditingProduct(product)
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingProduct(null)
  }

  async function handleSave(data: ProductFormData): Promise<string | null> {
    const result = editingProduct
      ? await updateProduct(editingProduct.id, data)
      : await createProduct(data)
    if (!result) {
      setShowForm(false)
      setEditingProduct(null)
    }
    return result
  }

  async function handleToggle(product: Product) {
    await togglePublished(product.id, !product.published)
  }

  if (showForm) {
    return (
      <div className={styles.container} data-testid="admin-productos">
        <div className={styles.header}>
          <h2 className={styles.title}>
            {editingProduct ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
          </h2>
        </div>
        <ProductForm
          product={editingProduct ?? undefined}
          onSave={handleSave}
          onCancel={handleCancel}
          onUploadImage={uploadImage}
        />
      </div>
    )
  }

  return (
    <div className={styles.container} data-testid="admin-productos">
      <div className={styles.header}>
        <h2 className={styles.title}>PRODUCTOS</h2>
        <button className={styles.newBtn} onClick={handleNew} data-testid="new-product-btn">
          + NUEVO PRODUCTO
        </button>
      </div>

      {loading && <div className={styles.loading} data-testid="products-loading" />}
      {error && (
        <div className={styles.error} data-testid="products-error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <table className={styles.table} data-testid="products-table">
          <thead>
            <tr>
              <th className={styles.th}>FOTO</th>
              <th className={styles.th}>CÓDIGO</th>
              <th className={styles.th}>CATEGORÍA</th>
              <th className={styles.th}>PRECIO</th>
              <th className={styles.th}>TALLAS / STOCK</th>
              <th className={styles.th}>ESTADO</th>
              <th className={styles.th}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className={styles.tr} data-testid={`product-row-${product.id}`}>
                <td className={styles.td}>
                  {product.product_images[0] ? (
                    <img
                      className={styles.thumb}
                      src={product.product_images[0].storage_path}
                      alt={product.code}
                    />
                  ) : (
                    <div className={styles.noImage}>—</div>
                  )}
                </td>
                <td className={styles.td}>{product.code}</td>
                <td className={styles.td}>{product.category_slug.toUpperCase()}</td>
                <td className={styles.td}>${product.price}</td>
                <td className={styles.td}>
                  {product.product_sizes.map((sz, i) => (
                    <span key={i} className={styles.sizeTag}>
                      {sz.size_us ?? sz.size_eu ?? '?'} ({sz.stock})
                    </span>
                  ))}
                </td>
                <td className={styles.td}>
                  <span
                    className={product.published ? styles.published : styles.draft}
                    data-testid={`status-${product.id}`}
                  >
                    {product.published ? 'PUBLICADO' : 'BORRADOR'}
                  </span>
                </td>
                <td className={styles.td}>
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleEdit(product)}
                    data-testid={`edit-btn-${product.id}`}
                  >
                    EDITAR
                  </button>
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleToggle(product)}
                    data-testid={`toggle-btn-${product.id}`}
                  >
                    {product.published ? 'OCULTAR' : 'PUBLICAR'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
