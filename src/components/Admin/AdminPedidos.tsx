import { useAdminOrders } from '@/hooks/useAdminOrders'
import type { OrderStatus, OrderWithItems } from '@/types'
import styles from './AdminPedidos.module.css'

const FILTERS: Array<{ label: string; value: OrderStatus | 'all' }> = [
  { label: 'TODOS', value: 'all' },
  { label: 'PENDIENTES', value: 'pending' },
  { label: 'PAGADOS', value: 'paid' },
  { label: 'FALLIDOS', value: 'failed' },
]

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'PENDIENTE',
  paid: 'PAGADO',
  failed: 'FALLIDO',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

function formatItems(order: OrderWithItems): string {
  return order.items
    .map((item) => `${item.product_code} (T:${item.size} x${item.quantity})`)
    .join(', ')
}

export function AdminPedidos() {
  const { orders, loading, error, filterStatus, setFilterStatus } = useAdminOrders()

  return (
    <div className={styles.container} data-testid="admin-pedidos">
      <div className={styles.header}>
        <h2 className={styles.title}>PEDIDOS</h2>
      </div>

      <div className={styles.filters} data-testid="filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={styles.filterBtn}
            data-active={filterStatus === f.value}
            data-testid={`filter-${f.value}`}
            onClick={() => setFilterStatus(f.value)}
            type="button"
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className={styles.loading} data-testid="orders-loading">
          Cargando pedidos...
        </div>
      )}

      {error && (
        <div className={styles.error} data-testid="orders-error">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className={styles.empty} data-testid="orders-empty">
          {filterStatus === 'all'
            ? 'No hay pedidos todavía'
            : 'No hay pedidos con este estado'}
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <table className={styles.table} data-testid="orders-table">
          <thead>
            <tr>
              <th className={styles.th}>FECHA</th>
              <th className={styles.th}>EMAIL</th>
              <th className={styles.th}>PRODUCTOS</th>
              <th className={styles.th}>TOTAL</th>
              <th className={styles.th}>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className={styles.tr} data-testid={`order-row-${order.id}`}>
                <td className={styles.td}>{formatDate(order.created_at)}</td>
                <td className={styles.td} data-testid={`order-email-${order.id}`}>
                  {order.email}
                </td>
                <td className={styles.td}>{formatItems(order)}</td>
                <td className={styles.td} data-testid={`order-total-${order.id}`}>
                  ${order.total.toFixed(2)}
                </td>
                <td className={styles.td}>
                  <span
                    className={styles[`badge_${order.status}`]}
                    data-testid={`order-status-${order.id}`}
                  >
                    {STATUS_LABEL[order.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
