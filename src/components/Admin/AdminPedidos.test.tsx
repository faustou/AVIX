import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdminPedidos } from './AdminPedidos'

const mockUseAdminOrders = vi.hoisted(() => vi.fn())
vi.mock('@/hooks/useAdminOrders', () => ({ useAdminOrders: mockUseAdminOrders }))

const mockSetFilterStatus = vi.fn()
const mockUpdateOrderStatus = vi.fn()

const orders = [
  {
    id: 'o1',
    email: 'buyer@test.com',
    status: 'paid' as const,
    total: 150,
    created_at: '2024-06-15T10:30:00Z',
    tracking_number: null,
    shipped_at: null,
    items: [
      { id: 'oi1', product_id: 'p1', product_code: 'YS-01', size: '8', quantity: 2, unit_price: 75 },
    ],
  },
  {
    id: 'o2',
    email: 'other@test.com',
    status: 'pending' as const,
    total: 40,
    created_at: '2024-06-16T14:00:00Z',
    tracking_number: null,
    shipped_at: null,
    items: [],
  },
  {
    id: 'o3',
    email: 'fail@test.com',
    status: 'failed' as const,
    total: 80,
    created_at: '2024-06-17T09:00:00Z',
    tracking_number: null,
    shipped_at: null,
    items: [],
  },
]

beforeEach(() => {
  mockSetFilterStatus.mockReset()
  mockUpdateOrderStatus.mockReset().mockResolvedValue(null)
  mockUseAdminOrders.mockReturnValue({
    orders,
    loading: false,
    error: null,
    filterStatus: 'all',
    setFilterStatus: mockSetFilterStatus,
    refetch: vi.fn(),
    updateOrderStatus: mockUpdateOrderStatus,
  })
})

function renderPedidos() {
  render(
    <MemoryRouter>
      <AdminPedidos />
    </MemoryRouter>,
  )
}

describe('AdminPedidos', () => {
  it('renderiza el título PEDIDOS', () => {
    renderPedidos()
    expect(screen.getByText('PEDIDOS')).toBeInTheDocument()
  })

  it('muestra los filtros TODOS / PENDIENTES / PAGADOS / FALLIDOS', () => {
    renderPedidos()
    expect(screen.getByTestId('filter-all')).toBeInTheDocument()
    expect(screen.getByTestId('filter-pending')).toBeInTheDocument()
    expect(screen.getByTestId('filter-paid')).toBeInTheDocument()
    expect(screen.getByTestId('filter-failed')).toBeInTheDocument()
  })

  it('renderiza una fila por cada orden', () => {
    renderPedidos()
    expect(screen.getByTestId('order-row-o1')).toBeInTheDocument()
    expect(screen.getByTestId('order-row-o2')).toBeInTheDocument()
    expect(screen.getByTestId('order-row-o3')).toBeInTheDocument()
  })

  it('muestra email y total de cada orden', () => {
    renderPedidos()
    expect(screen.getByTestId('order-email-o1')).toHaveTextContent('buyer@test.com')
    expect(screen.getByTestId('order-total-o1')).toHaveTextContent('$150.00')
    expect(screen.getByTestId('order-email-o2')).toHaveTextContent('other@test.com')
    expect(screen.getByTestId('order-total-o2')).toHaveTextContent('$40.00')
  })

  it('el badge muestra PAGADO para status="paid"', () => {
    renderPedidos()
    expect(screen.getByTestId('order-status-o1')).toHaveTextContent('PAGADO')
  })

  it('el badge muestra PENDIENTE para status="pending"', () => {
    renderPedidos()
    expect(screen.getByTestId('order-status-o2')).toHaveTextContent('PENDIENTE')
  })

  it('el badge muestra FALLIDO para status="failed"', () => {
    renderPedidos()
    expect(screen.getByTestId('order-status-o3')).toHaveTextContent('FALLIDO')
  })

  it('muestra "Cargando pedidos..." mientras loading=true', () => {
    mockUseAdminOrders.mockReturnValueOnce({
      orders: [],
      loading: true,
      error: null,
      filterStatus: 'all',
      setFilterStatus: mockSetFilterStatus,
      refetch: vi.fn(),
    })
    renderPedidos()
    expect(screen.getByTestId('orders-loading')).toHaveTextContent('Cargando pedidos...')
  })

  it('muestra estado vacío "No hay pedidos todavía" con filterStatus=all', () => {
    mockUseAdminOrders.mockReturnValueOnce({
      orders: [],
      loading: false,
      error: null,
      filterStatus: 'all',
      setFilterStatus: mockSetFilterStatus,
      refetch: vi.fn(),
    })
    renderPedidos()
    expect(screen.getByTestId('orders-empty')).toHaveTextContent('No hay pedidos todavía')
  })

  it('muestra "No hay pedidos con este estado" cuando filterStatus !== all y no hay órdenes', () => {
    mockUseAdminOrders.mockReturnValueOnce({
      orders: [],
      loading: false,
      error: null,
      filterStatus: 'paid',
      setFilterStatus: mockSetFilterStatus,
      refetch: vi.fn(),
    })
    renderPedidos()
    expect(screen.getByTestId('orders-empty')).toHaveTextContent('No hay pedidos con este estado')
  })

  it('al hacer clic en PAGADOS llama a setFilterStatus con "paid"', async () => {
    renderPedidos()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('filter-paid'))
    expect(mockSetFilterStatus).toHaveBeenCalledWith('paid')
  })

  it('filtro incluye ENVIADOS', () => {
    renderPedidos()
    expect(screen.getByTestId('filter-shipped')).toBeInTheDocument()
    expect(screen.getByTestId('filter-shipped')).toHaveTextContent('ENVIADOS')
  })

  it('badge "shipped" muestra ENVIADO', () => {
    mockUseAdminOrders.mockReturnValueOnce({
      orders: [{ ...orders[0], id: 'o4', status: 'shipped', tracking_number: 'TRACK-1', shipped_at: '2024-06-18T12:00:00Z' }],
      loading: false,
      error: null,
      filterStatus: 'all',
      setFilterStatus: mockSetFilterStatus,
      refetch: vi.fn(),
      updateOrderStatus: mockUpdateOrderStatus,
    })
    renderPedidos()
    expect(screen.getByTestId('order-status-o4')).toHaveTextContent('ENVIADO')
  })

  it('botón VER expande el detalle del pedido', async () => {
    renderPedidos()
    expect(screen.queryByTestId('detail-o1')).not.toBeInTheDocument()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('view-btn-o1'))
    expect(screen.getByTestId('detail-o1')).toBeInTheDocument()
  })

  it('detalle muestra los items del pedido', async () => {
    renderPedidos()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('view-btn-o1'))
    expect(screen.getByText('YS-01')).toBeInTheDocument()
  })

  it('para status="paid" muestra botón MARCAR COMO ENVIADO', async () => {
    renderPedidos()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('view-btn-o1'))
    expect(screen.getByTestId('mark-shipped-o1')).toBeInTheDocument()
  })

  it('para status="pending" muestra botón MARCAR COMO PAGADO', async () => {
    renderPedidos()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('view-btn-o2'))
    expect(screen.getByTestId('mark-paid-o2')).toBeInTheDocument()
  })

  it('al tocar MARCAR COMO ENVIADO llama a updateOrderStatus', async () => {
    renderPedidos()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('view-btn-o1'))
    await user.click(screen.getByTestId('mark-shipped-o1'))
    expect(mockUpdateOrderStatus).toHaveBeenCalledWith('o1', 'shipped', undefined)
  })
})
