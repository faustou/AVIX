import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductForm } from './ProductForm'

vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }: any) => <>{children}</>,
  Droppable: ({ children }: any) =>
    children({ innerRef: () => {}, droppableProps: {}, placeholder: null }, {}),
  Draggable: ({ children }: any) =>
    children({ innerRef: () => {}, draggableProps: {}, dragHandleProps: {} }, {}),
}))

const mockOnSave = vi.fn()
const mockOnCancel = vi.fn()
const mockOnUploadImage = vi.fn()

beforeEach(() => {
  mockOnSave.mockReset().mockResolvedValue(null)
  mockOnCancel.mockReset()
  mockOnUploadImage.mockReset().mockResolvedValue({ path: 'uploaded.jpg' })
})

function renderForm(product?: any) {
  render(
    <ProductForm
      product={product}
      onSave={mockOnSave}
      onCancel={mockOnCancel}
      onUploadImage={mockOnUploadImage}
    />,
  )
}

describe('ProductForm', () => {
  it('renderiza el formulario vacío para nuevo producto', () => {
    renderForm()
    expect(screen.getByTestId('product-form')).toBeInTheDocument()
    expect(screen.getByTestId('input-code')).toHaveValue('')
    expect(screen.getByTestId('input-price')).toHaveValue(0)
  })

  it('pre-rellena los campos si se pasa un producto', () => {
    const product = {
      id: 'p1',
      code: 'ABC-001',
      category_slug: 'mens',
      price: 100,
      information: 'some info',
      size_system: 'letter',
      created_at: '2024-01-01',
      published: true,
      product_images: [],
      product_sizes: [],
    }
    renderForm(product)
    expect(screen.getByTestId('input-code')).toHaveValue('ABC-001')
    expect(screen.getByTestId('input-price')).toHaveValue(100)
    expect(screen.getByTestId('input-information')).toHaveValue('some info')
  })

  it('al hacer click en CANCELAR llama a onCancel', async () => {
    renderForm()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('cancel-btn'))
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('al hacer click en GUARDAR BORRADOR llama a onSave con published=false', async () => {
    renderForm()
    const user = userEvent.setup()
    await user.type(screen.getByTestId('input-code'), 'TEST-001')
    await user.click(screen.getByTestId('save-draft-btn'))
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'TEST-001', published: false }),
    )
  })

  it('al hacer click en PUBLICAR Y GUARDAR llama a onSave con published=true', async () => {
    renderForm()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('save-publish-btn'))
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({ published: true }))
  })

  it('agrega talla al hacer click en + con datos', async () => {
    renderForm()
    const user = userEvent.setup()
    await user.selectOptions(screen.getByTestId('new-size-letter'), 'M')
    await user.type(screen.getByTestId('new-size-stock'), '5')
    await user.click(screen.getByTestId('add-size-btn'))
    expect(screen.getByTestId('size-row-0')).toBeInTheDocument()
  })

  it('muestra error si onSave retorna un mensaje', async () => {
    mockOnSave.mockResolvedValueOnce('Error al guardar')
    renderForm()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('save-draft-btn'))
    expect(screen.getByTestId('form-error')).toHaveTextContent('Error al guardar')
  })
})
