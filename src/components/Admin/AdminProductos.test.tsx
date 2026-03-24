import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdminProductos } from './AdminProductos'

const mockUseAdminProducts = vi.hoisted(() => vi.fn())
vi.mock('@/hooks/useAdminProducts', () => ({ useAdminProducts: mockUseAdminProducts }))

vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }: any) => <>{children}</>,
  Droppable: ({ children }: any) =>
    children({ innerRef: () => {}, droppableProps: {}, placeholder: null }, {}),
  Draggable: ({ children }: any) =>
    children({ innerRef: () => {}, draggableProps: {}, dragHandleProps: {} }, {}),
}))

const mockCreateProduct = vi.fn()
const mockUpdateProduct = vi.fn()
const mockTogglePublished = vi.fn()
const mockUploadImage = vi.fn()

const products = [
  {
    id: 'p1',
    code: 'ABC-001',
    category_slug: 'mens',
    price: 100,
    information: null,
    size_system: 'letter',
    created_at: '2024-01-01',
    published: true,
    product_images: [],
    product_sizes: [{ id: 's1', product_id: 'p1', size_us: 'M', size_eu: null, stock: 3 }],
  },
  {
    id: 'p2',
    code: 'XYZ-002',
    category_slug: 'womens',
    price: 80,
    information: null,
    size_system: 'letter',
    created_at: '2024-01-02',
    published: false,
    product_images: [],
    product_sizes: [],
  },
]

beforeEach(() => {
  mockCreateProduct.mockReset().mockResolvedValue(null)
  mockUpdateProduct.mockReset().mockResolvedValue(null)
  mockTogglePublished.mockReset().mockResolvedValue(null)
  mockUploadImage.mockReset().mockResolvedValue({ path: 'img.jpg' })
  mockUseAdminProducts.mockReturnValue({
    products,
    loading: false,
    error: null,
    refetch: vi.fn(),
    createProduct: mockCreateProduct,
    updateProduct: mockUpdateProduct,
    togglePublished: mockTogglePublished,
    uploadImage: mockUploadImage,
    deleteImage: vi.fn(),
  })
})

function renderAdmin() {
  render(
    <MemoryRouter>
      <AdminProductos />
    </MemoryRouter>,
  )
}

describe('AdminProductos', () => {
  it('renderiza tabla con los productos', () => {
    renderAdmin()
    expect(screen.getByTestId('products-table')).toBeInTheDocument()
    expect(screen.getByTestId('product-row-p1')).toBeInTheDocument()
    expect(screen.getByTestId('product-row-p2')).toBeInTheDocument()
  })

  it('muestra loading cuando loading=true', () => {
    mockUseAdminProducts.mockReturnValueOnce({
      products: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
      createProduct: mockCreateProduct,
      updateProduct: mockUpdateProduct,
      togglePublished: mockTogglePublished,
      uploadImage: mockUploadImage,
      deleteImage: vi.fn(),
    })
    renderAdmin()
    expect(screen.getByTestId('products-loading')).toBeInTheDocument()
  })

  it('muestra error cuando hay error', () => {
    mockUseAdminProducts.mockReturnValueOnce({
      products: [],
      loading: false,
      error: 'DB error',
      refetch: vi.fn(),
      createProduct: mockCreateProduct,
      updateProduct: mockUpdateProduct,
      togglePublished: mockTogglePublished,
      uploadImage: mockUploadImage,
      deleteImage: vi.fn(),
    })
    renderAdmin()
    expect(screen.getByTestId('products-error')).toBeInTheDocument()
  })

  it('clic en NUEVO PRODUCTO muestra el formulario', async () => {
    renderAdmin()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('new-product-btn'))
    expect(screen.getByTestId('product-form')).toBeInTheDocument()
  })

  it('clic en EDITAR muestra el formulario con datos del producto', async () => {
    renderAdmin()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('edit-btn-p1'))
    expect(screen.getByTestId('product-form')).toBeInTheDocument()
    expect(screen.getByTestId('input-code')).toHaveValue('ABC-001')
  })

  it('clic en PUBLICAR/OCULTAR llama a togglePublished', async () => {
    renderAdmin()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('toggle-btn-p1'))
    expect(mockTogglePublished).toHaveBeenCalledWith('p1', false)
  })
})
