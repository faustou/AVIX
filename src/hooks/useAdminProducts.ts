import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product, ProductFormData, Category } from '@/types'

function mapProduct(p: any): Product {
  return {
    id: p.id,
    code: p.code,
    category_slug: (p.category_slug ?? 'new') as Category,
    price: p.price,
    information: p.information ?? null,
    size_system: (p.size_system ?? 'letter') as Product['size_system'],
    created_at: p.created_at ?? '',
    published: p.published ?? false,
    product_images: ((p.product_images ?? []) as any[])
      .sort((a, b) => a.position - b.position)
      .map((img) => ({
        id: img.id,
        product_id: p.id,
        storage_path: supabase.storage
          .from('product-images')
          .getPublicUrl(img.storage_path).data.publicUrl,
        position: img.position,
      })),
    product_sizes: ((p.product_sizes ?? []) as any[]).map((sz) => ({
      id: sz.id,
      product_id: p.id,
      size_us: sz.size_us ?? null,
      size_eu: sz.size_eu ?? null,
      stock: sz.stock ?? 0,
    })),
  }
}

export function useAdminProducts(): {
  products: Product[]
  loading: boolean
  error: string | null
  refetch: () => void
  createProduct: (data: ProductFormData) => Promise<string | null>
  updateProduct: (id: string, data: ProductFormData) => Promise<string | null>
  togglePublished: (id: string, published: boolean) => Promise<string | null>
  uploadImage: (file: File) => Promise<{ path: string } | { error: string }>
  deleteImage: (storagePath: string) => Promise<string | null>
} {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false

    async function fetchProducts() {
      setLoading(true)
      setError(null)

      const { data, error: dbError } = await supabase
        .from('products')
        .select(`
          *,
          product_images (id, storage_path, position),
          product_sizes (id, size_us, size_eu, stock)
        `)
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (dbError) {
        setError(dbError.message)
        setLoading(false)
        return
      }

      setProducts((data ?? []).map(mapProduct))
      setLoading(false)
    }

    fetchProducts()
    return () => { cancelled = true }
  }, [tick])

  async function createProduct(data: ProductFormData): Promise<string | null> {
    const { data: inserted, error: insertError } = await supabase
      .from('products')
      .insert({
        code: data.code,
        category_slug: data.category_slug,
        price: data.price,
        information: data.information || null,
        size_system: data.size_system,
        published: data.published,
      })
      .select('id')
      .single()

    if (insertError) return insertError.message
    const productId = (inserted as any).id

    if (data.images.length > 0) {
      const { error: imgError } = await supabase.from('product_images').insert(
        data.images.map((img) => ({
          product_id: productId,
          storage_path: img.storage_path,
          position: img.position,
        })),
      )
      if (imgError) return imgError.message
    }

    if (data.sizes.length > 0) {
      const { error: sizeError } = await supabase.from('product_sizes').insert(
        data.sizes.map((sz) => ({
          product_id: productId,
          size_us: sz.size_us,
          size_eu: sz.size_eu,
          stock: sz.stock,
        })),
      )
      if (sizeError) return sizeError.message
    }

    refetch()
    return null
  }

  async function updateProduct(id: string, data: ProductFormData): Promise<string | null> {
    const { error: updateError } = await supabase
      .from('products')
      .update({
        code: data.code,
        category_slug: data.category_slug,
        price: data.price,
        information: data.information || null,
        size_system: data.size_system,
        published: data.published,
      })
      .eq('id', id)

    if (updateError) return updateError.message

    const { error: delImgError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', id)
    if (delImgError) return delImgError.message

    const { error: delSizeError } = await supabase
      .from('product_sizes')
      .delete()
      .eq('product_id', id)
    if (delSizeError) return delSizeError.message

    if (data.images.length > 0) {
      const { error: imgError } = await supabase.from('product_images').insert(
        data.images.map((img) => ({
          product_id: id,
          storage_path: img.storage_path,
          position: img.position,
        })),
      )
      if (imgError) return imgError.message
    }

    if (data.sizes.length > 0) {
      const { error: sizeError } = await supabase.from('product_sizes').insert(
        data.sizes.map((sz) => ({
          product_id: id,
          size_us: sz.size_us,
          size_eu: sz.size_eu,
          stock: sz.stock,
        })),
      )
      if (sizeError) return sizeError.message
    }

    refetch()
    return null
  }

  async function togglePublished(id: string, published: boolean): Promise<string | null> {
    const { error: toggleError } = await supabase
      .from('products')
      .update({ published })
      .eq('id', id)
    if (toggleError) return toggleError.message
    refetch()
    return null
  }

  async function uploadImage(file: File): Promise<{ path: string } | { error: string }> {
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { upsert: true })
    if (uploadError) return { error: uploadError.message }
    return { path: (data as any).path }
  }

  async function deleteImage(storagePath: string): Promise<string | null> {
    const { error: removeError } = await supabase.storage
      .from('product-images')
      .remove([storagePath])
    if (removeError) return removeError.message
    return null
  }

  return { products, loading, error, refetch, createProduct, updateProduct, togglePublished, uploadImage, deleteImage }
}
