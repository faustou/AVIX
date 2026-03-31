export type Category = 'new' | 'joggings' | 'musculosas' | 'remeras' | 'camperas' | 'gollerias'

export interface CategoryData {
  id: string
  slug: Category
  label: string
}

export interface ProductImage {
  id: string
  product_id: string
  storage_path: string
  position: number
}

export interface ProductSize {
  id: string
  product_id: string
  size_us: string | null
  size_eu: string | null
  stock: number | null
}

export interface Product {
  id: string
  code: string
  category_slug: Category
  price: number
  discount_price: number | null
  information: string | null
  size_system: 'us_eu' | 'letter' | 'numeric'
  created_at: string
  published?: boolean | null
  peso?: number | null
  product_images: ProductImage[]
  product_sizes: ProductSize[]
}

export interface ProductFormData {
  code: string
  category_slug: Category
  price: number
  discount_price: number | null
  information: string
  size_system: 'us_eu' | 'letter' | 'numeric'
  published: boolean
  images: Array<{ storage_path: string; position: number }>
  sizes: Array<{ size_us: string | null; size_eu: string | null; stock: number }>
}

export interface CartItem {
  product: Product
  size: string
  quantity: number
}

export interface CartState {
  items: CartItem[]
}

export interface ShippingAddress {
  nombre: string
  apellido: string
  calle: string
  numero: string
  piso?: string
  depto?: string
  cp: string
  localidad: string
  provincia: string
}

export interface ShippingOption {
  correo_id: number
  correo_nombre: string
  valor: number
  horas_entrega: number | null
  fecha_estimada: string | null
}

export interface Order {
  id: string
  email: string
  mp_preference_id: string | null
  mp_payment_id: string | null
  status: 'pending' | 'paid' | 'failed'
  total: number
  created_at: string
  shipping_carrier?: string | null
  shipping_service?: string | null
  shipping_cost?: number | null
  shipping_estimated_hours?: number | null
  shipping_estimated_date?: string | null
  shipping_address?: ShippingAddress | null
}

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'shipped'

export interface OrderItem {
  id: string
  product_id: string
  product_code: string
  size: string
  quantity: number
  unit_price: number
}

export interface OrderWithItems {
  id: string
  email: string
  status: OrderStatus
  total: number
  created_at: string
  tracking_number: string | null
  shipped_at: string | null
  items: OrderItem[]
}
