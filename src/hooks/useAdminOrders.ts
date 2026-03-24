import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { OrderWithItems, OrderStatus } from '@/types'

function mapOrder(o: any): OrderWithItems {
  return {
    id: o.id,
    email: o.email ?? '',
    status: o.status as OrderStatus,
    total: o.total ?? 0,
    created_at: o.created_at ?? '',
    items: ((o.order_items ?? []) as any[]).map((item) => ({
      id: item.id,
      product_id: item.product_id,
      product_code: item.products?.code ?? '',
      size: item.size ?? '',
      quantity: item.quantity ?? 0,
      unit_price: item.unit_price ?? 0,
    })),
  }
}

export function useAdminOrders(): {
  orders: OrderWithItems[]
  loading: boolean
  error: string | null
  filterStatus: OrderStatus | 'all'
  setFilterStatus: (status: OrderStatus | 'all') => void
  refetch: () => Promise<void>
} {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const [tick, setTick] = useState(0)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          size,
          quantity,
          unit_price,
          products (code)
        )
      `)

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus)
    }

    const { data, error: dbError } = await query.order('created_at', { ascending: false })

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    setOrders((data ?? []).map(mapOrder))
    setLoading(false)
  }, [filterStatus, tick]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const refetch = useCallback(async () => {
    setTick((t) => t + 1)
  }, [])

  return { orders, loading, error, filterStatus, setFilterStatus, refetch }
}
