import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Category, Product } from '@/types'

export function useProducts(category: Category): {
  products: Product[]
  loading: boolean
  error: string | null
} {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchProducts() {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('products')
        .select(`
          *,
          product_images (id, storage_path, position),
          product_sizes (id, size_us, size_eu, stock)
        `)
        .eq('published', true)

      if (category !== 'new') {
        query = query.eq('category_slug', category)
      }

      const { data, error: dbError } = await query.order('created_at', { ascending: false })

      if (cancelled) return

      if (dbError) {
        setError(dbError.message)
        setLoading(false)
        return
      }

      const mapped: Product[] = (data ?? []).map((p) => ({
        id: p.id,
        code: p.code,
        category_slug: (p.category_slug ?? 'new') as Category,
        price: p.price,
        discount_price: (p as any).discount_price ?? null,
        information: p.information ?? null,
        size_system: (p.size_system ?? 'letter') as Product['size_system'],
        created_at: p.created_at ?? '',
        product_images: ((p as any).product_images ?? [])
          .sort((a: any, b: any) => a.position - b.position)
          .map((img: any) => ({
            id: img.id,
            product_id: p.id,
            storage_path: supabase.storage
              .from('product-images')
              .getPublicUrl(img.storage_path).data.publicUrl,
            position: img.position,
          })),
        product_sizes: ((p as any).product_sizes ?? []).map((sz: any) => ({
          id: sz.id,
          product_id: p.id,
          size_us: sz.size_us ?? null,
          size_eu: sz.size_eu ?? null,
          stock: sz.stock ?? 0,
        })),
      }))

      setProducts(mapped)
      setLoading(false)
    }

    fetchProducts()

    return () => {
      cancelled = true
    }
  }, [category])

  return { products, loading, error }
}
