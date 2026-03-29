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

export interface Order {
  id: string
  email: string
  mp_preference_id: string | null
  mp_payment_id: string | null
  status: 'pending' | 'paid' | 'failed'
  total: number
  created_at: string
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
