import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/hooks/useCart'

export function useCheckout(): {
  loading: boolean
  error: string | null
  startCheckout: (email: string) => Promise<string | null>
} {
  const { items, subtotal } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startCheckout(email: string): Promise<string | null> {
    setLoading(true)
    setError(null)

    try {
      // DEBUG TEMPORAL — remover antes de producción final
      console.log('SUPABASE URL:', import.meta.env.VITE_SUPABASE_URL)
      console.log('ANON KEY (primeros 20 chars):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20))

      // 1. Crear orden
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({ email, total: subtotal, status: 'pending' })
        .select()
        .single()

      if (orderErr || !order) {
        setError(orderErr?.message ?? 'Error creando la orden')
        return null
      }

      // 2. Insertar order_items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.product.price,
      }))

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
      if (itemsErr) {
        setError(itemsErr.message)
        return null
      }

      // 3. Llamar Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-mp-preference`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            items: items.map((i) => ({
              title: i.product.code,
              quantity: i.quantity,
              unit_price: i.product.price,
              size: i.size,
            })),
            email,
            orderId: order.id,
          }),
        },
      )

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        setError(err.error ?? `Error ${response.status}`)
        return null
      }

      const data = await response.json()
      return data.preferenceId ?? null
    } catch (e) {
      setError((e as Error).message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, startCheckout }
}
