import React, { useState } from 'react'
import { useAdminOrders } from '@/hooks/useAdminOrders'
import type { OrderStatus, OrderWithItems } from '@/types'
import styles from './AdminPedidos.module.css'

const FILTERS: Array<{ label: string; value: OrderStatus | 'all' }> = [
  { label: 'TODOS', value: 'all' },
  { label: 'PENDIENTES', value: 'pending' },
  { label: 'PAGADOS', value: 'paid' },
  { label: 'ENVIADOS', value: 'shipped' },
  { label: 'FALLIDOS', value: 'failed' },
]

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'PENDIENTE',
  paid: 'PAGADO',
  shipped: 'ENVIADO',
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

interface DetailPanelProps {
  order: OrderWithItems
  onUpdateStatus: (id: string, status: OrderStatus, tracking?: string) => Promise<string | null>
}

function DetailPanel({ order, onUpdateStatus }: DetailPanelProps) {
  const [tracking, setTracking] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleUpdate(status: OrderStatus) {
    setBusy(true)
    setActionError(null)
    const err = await onUpdateStatus(order.id, status, tracking || undefined)
    if (err) setActionError(err)
    setBusy(false)
  }

  return (
    <div className={styles.detail} data-testid={`detail-${order.id}`}>
      <div className={styles.detailMeta}>
        <span className={styles.detailId}>ID: {order.id}</span>
        <span>{order.email}</span>
      </div>

      {order.items.length > 0 && (
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th className={styles.itemsTh}>PRODUCTO</th>
              <th className={styles.itemsTh}>TALLE</th>
              <th className={styles.itemsTh}>CANT.</th>
              <th className={styles.itemsTh}>PRECIO UNIT.</th>
              <th className={styles.itemsTh}>SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className={styles.itemsTr}>
                <td className={styles.itemsTd}>{item.product_code}</td>
                <td className={styles.itemsTd}>{item.size}</td>
                <td className={styles.itemsTd}>{item.quantity}</td>
                <td className={styles.itemsTd}>${item.unit_price.toFixed(2)}</td>
                <td className={styles.itemsTd}>${(item.unit_price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className={styles.detailTotal}>TOTAL: ${order.total.toFixed(2)}</div>

      {order.tracking_number && (
        <div className={styles.detailTracking}>
          SEGUIMIENTO: {order.tracking_number}
          {order.shipped_at && ` — ${formatDate(order.shipped_at)}`}
        </div>
      )}

      {actionError && <div className={styles.actionError}>{actionError}</div>}

      <div className={styles.actions} data-testid={`actions-${order.id}`}>
        {order.status === 'pending' && (
          <button
            className={styles.actionBtn}
            onClick={() => handleUpdate('paid')}
            disabled={busy}
            data-testid={`mark-paid-${order.id}`}
          >
            MARCAR COMO PAGADO
          </button>
        )}

        {order.status === 'paid' && (
          <>
            <input
              className={styles.trackingInput}
              placeholder="Número de seguimiento (opcional)"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              data-testid={`tracking-input-${order.id}`}
            />
            <button
              className={styles.actionBtn}
              onClick={() => handleUpdate('shipped')}
              disabled={busy}
              data-testid={`mark-shipped-${order.id}`}
            >
              MARCAR COMO ENVIADO
            </button>
            <button
              className={styles.actionBtnDanger}
              onClick={() => handleUpdate('failed')}
              disabled={busy}
              data-testid={`mark-failed-${order.id}`}
            >
              MARCAR COMO FALLIDO
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export function AdminPedidos() {
  const { orders, loading, error, filterStatus, setFilterStatus, updateOrderStatus } =
    useAdminOrders()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

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
              <th className={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <React.Fragment key={order.id}>
                <tr className={styles.tr} data-testid={`order-row-${order.id}`}>
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
                  <td className={styles.td}>
                    <button
                      className={styles.viewBtn}
                      onClick={() => toggleExpand(order.id)}
                      data-testid={`view-btn-${order.id}`}
                      type="button"
                    >
                      {expandedId === order.id ? 'CERRAR' : 'VER'}
                    </button>
                  </td>
                </tr>
                {expandedId === order.id && (
                  <tr className={styles.trDetail}>
                    <td colSpan={6} className={styles.tdDetail}>
                      <DetailPanel order={order} onUpdateStatus={updateOrderStatus} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
