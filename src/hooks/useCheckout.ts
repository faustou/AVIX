import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/hooks/useCart'
import type { ShippingAddress, ShippingOption } from '@/types'

interface CheckoutData {
  email: string
  shippingAddress: ShippingAddress
  shippingOption: ShippingOption
}

export function useCheckout(): {
  loading: boolean
  error: string | null
  startCheckout: (data: CheckoutData) => Promise<string | null>
} {
  const { items, subtotal } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startCheckout(data: CheckoutData): Promise<string | null> {
    const { email, shippingAddress, shippingOption } = data
    setLoading(true)
    setError(null)

    try {
      const total = subtotal + shippingOption.valor

      // 1. Crear orden con datos de envío
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          email,
          total,
          status: 'pending',
          shipping_carrier: shippingOption.correo_nombre,
          shipping_cost: shippingOption.valor,
          shipping_estimated_hours: shippingOption.horas_entrega,
          shipping_estimated_date: shippingOption.fecha_estimada,
          shipping_address: shippingAddress,
        })
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

      // 3. Llamar Edge Function con total que incluye envío
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-mp-preference`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            items: [
              ...items.map((i) => ({
                title: i.product.code,
                quantity: i.quantity,
                unit_price: i.product.price,
                size: i.size,
              })),
              {
                title: `Envío - ${shippingOption.correo_nombre}`,
                quantity: 1,
                unit_price: shippingOption.valor,
                size: '',
              },
            ],
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

      const responseData = await response.json()
      return responseData.preferenceId ?? null
    } catch (e) {
      setError((e as Error).message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, startCheckout }
}
