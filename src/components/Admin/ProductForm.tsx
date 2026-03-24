import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import type { Product, ProductFormData, Category } from '@/types'
import styles from './ProductForm.module.css'

interface ProductFormProps {
  product?: Product
  onSave: (data: ProductFormData) => Promise<string | null>
  onCancel: () => void
  onUploadImage: (file: File) => Promise<{ path: string } | { error: string }>
}

const CATEGORIES: Category[] = ['new', 'mens', 'womens', 'slides', 'accessories']

function productToFormData(product: Product): ProductFormData {
  return {
    code: product.code,
    category_slug: product.category_slug,
    price: product.price,
    information: product.information ?? '',
    size_system: product.size_system,
    published: product.published ?? false,
    images: product.product_images.map((img) => ({
      storage_path: img.storage_path,
      position: img.position,
    })),
    sizes: product.product_sizes.map((sz) => ({
      size_us: sz.size_us,
      size_eu: sz.size_eu,
      stock: sz.stock ?? 0,
    })),
  }
}

const EMPTY_FORM: ProductFormData = {
  code: '',
  category_slug: 'new',
  price: 0,
  information: '',
  size_system: 'letter',
  published: false,
  images: [],
  sizes: [],
}

export function ProductForm({ product, onSave, onCancel, onUploadImage }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(
    product ? productToFormData(product) : EMPTY_FORM,
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [newSize, setNewSize] = useState({ size_us: '', size_eu: '', stock: '' })

  function setField<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const result = await onUploadImage(file)
    setUploading(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    setForm((f) => ({
      ...f,
      images: [
        ...f.images,
        { storage_path: result.path, position: f.images.length },
      ],
    }))
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return
    const imgs = Array.from(form.images)
    const [moved] = imgs.splice(result.source.index, 1)
    imgs.splice(result.destination.index, 0, moved)
    setField('images', imgs.map((img, i) => ({ ...img, position: i })))
  }

  function removeImage(index: number) {
    setForm((f) => ({
      ...f,
      images: f.images
        .filter((_, i) => i !== index)
        .map((img, i) => ({ ...img, position: i })),
    }))
  }

  function addSize() {
    if (!newSize.size_us && !newSize.size_eu) return
    setForm((f) => ({
      ...f,
      sizes: [
        ...f.sizes,
        {
          size_us: newSize.size_us || null,
          size_eu: newSize.size_eu || null,
          stock: parseInt(newSize.stock) || 0,
        },
      ],
    }))
    setNewSize({ size_us: '', size_eu: '', stock: '' })
  }

  function removeSize(index: number) {
    setForm((f) => ({ ...f, sizes: f.sizes.filter((_, i) => i !== index) }))
  }

  async function handleSubmit(publish: boolean) {
    setSaving(true)
    setError(null)
    const result = await onSave({ ...form, published: publish })
    setSaving(false)
    if (result) setError(result)
  }

  return (
    <div className={styles.form} data-testid="product-form">
      {error && (
        <div className={styles.error} data-testid="form-error">
          {error}
        </div>
      )}

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>INFO BÁSICA</h3>

        <label className={styles.label}>CÓDIGO</label>
        <input
          className={styles.input}
          data-testid="input-code"
          value={form.code}
          onChange={(e) => setField('code', e.target.value)}
        />

        <label className={styles.label}>CATEGORÍA</label>
        <select
          className={styles.select}
          data-testid="input-category"
          value={form.category_slug}
          onChange={(e) => setField('category_slug', e.target.value as Category)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.toUpperCase()}
            </option>
          ))}
        </select>

        <label className={styles.label}>PRECIO</label>
        <input
          className={styles.input}
          data-testid="input-price"
          type="number"
          value={form.price}
          onChange={(e) => setField('price', parseFloat(e.target.value) || 0)}
        />

        <label className={styles.label}>INFORMACIÓN</label>
        <textarea
          className={styles.textarea}
          data-testid="input-information"
          value={form.information}
          onChange={(e) => setField('information', e.target.value)}
          rows={3}
        />

        <label className={styles.label}>SISTEMA DE TALLAS</label>
        <select
          className={styles.select}
          data-testid="input-size-system"
          value={form.size_system}
          onChange={(e) => setField('size_system', e.target.value as ProductFormData['size_system'])}
        >
          <option value="us_eu">US / EU</option>
          <option value="letter">LETTER</option>
          <option value="numeric">NUMERIC</option>
        </select>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>IMÁGENES</h3>
        <label className={styles.uploadLabel} data-testid="upload-image-label">
          {uploading ? 'SUBIENDO...' : '+ AGREGAR IMAGEN'}
          <input
            type="file"
            accept="image/*"
            className={styles.fileInput}
            data-testid="upload-image-input"
            onChange={handleImageUpload}
            disabled={uploading}
          />
        </label>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="images" direction="horizontal">
            {(provided) => (
              <div
                className={styles.imageList}
                ref={provided.innerRef}
                {...provided.droppableProps}
                data-testid="image-list"
              >
                {form.images.map((img, index) => (
                  <Draggable key={img.storage_path} draggableId={img.storage_path} index={index}>
                    {(dragProvided) => (
                      <div
                        className={styles.imageItem}
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        data-testid={`image-item-${index}`}
                      >
                        <span className={styles.imagePath}>{img.storage_path.split('/').pop()}</span>
                        <button
                          className={styles.removeBtn}
                          onClick={() => removeImage(index)}
                          data-testid={`remove-image-${index}`}
                          type="button"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>TALLAS</h3>

        <div className={styles.sizeForm}>
          <input
            className={styles.inputSmall}
            placeholder="US"
            value={newSize.size_us}
            onChange={(e) => setNewSize((s) => ({ ...s, size_us: e.target.value }))}
            data-testid="new-size-us"
          />
          <input
            className={styles.inputSmall}
            placeholder="EU"
            value={newSize.size_eu}
            onChange={(e) => setNewSize((s) => ({ ...s, size_eu: e.target.value }))}
            data-testid="new-size-eu"
          />
          <input
            className={styles.inputSmall}
            placeholder="STOCK"
            type="number"
            value={newSize.stock}
            onChange={(e) => setNewSize((s) => ({ ...s, stock: e.target.value }))}
            data-testid="new-size-stock"
          />
          <button
            className={styles.addSizeBtn}
            onClick={addSize}
            data-testid="add-size-btn"
            type="button"
          >
            +
          </button>
        </div>

        <div className={styles.sizeList} data-testid="size-list">
          {form.sizes.map((sz, i) => (
            <div key={i} className={styles.sizeRow} data-testid={`size-row-${i}`}>
              <span>{sz.size_us ?? '-'} / {sz.size_eu ?? '-'}</span>
              <span>stock: {sz.stock}</span>
              <button
                className={styles.removeBtn}
                onClick={() => removeSize(i)}
                data-testid={`remove-size-${i}`}
                type="button"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.actions}>
        <button
          className={styles.cancelBtn}
          onClick={onCancel}
          data-testid="cancel-btn"
          type="button"
        >
          CANCELAR
        </button>
        <button
          className={styles.draftBtn}
          onClick={() => handleSubmit(false)}
          disabled={saving}
          data-testid="save-draft-btn"
          type="button"
        >
          GUARDAR BORRADOR
        </button>
        <button
          className={styles.publishBtn}
          onClick={() => handleSubmit(true)}
          disabled={saving}
          data-testid="save-publish-btn"
          type="button"
        >
          PUBLICAR Y GUARDAR
        </button>
      </section>
    </div>
  )
}
