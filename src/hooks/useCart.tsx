import { createContext, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { CartItem, CartState, Product } from '@/types'

// ── Actions ──────────────────────────────────────────────────

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; size: string }
  | { type: 'REMOVE_ITEM'; productId: string; size: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; size: string; qty: number }
  | { type: 'CLEAR_CART' }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.find(
        (i) => i.product.id === action.product.id && i.size === action.size,
      )
      if (exists) {
        return {
          items: state.items.map((i) =>
            i.product.id === action.product.id && i.size === action.size
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        }
      }
      return {
        items: [
          ...state.items,
          { product: action.product, size: action.size, quantity: 1 },
        ],
      }
    }

    case 'REMOVE_ITEM':
      return {
        items: state.items.filter(
          (i) => !(i.product.id === action.productId && i.size === action.size),
        ),
      }

    case 'UPDATE_QUANTITY': {
      if (action.qty <= 0) {
        return {
          items: state.items.filter(
            (i) => !(i.product.id === action.productId && i.size === action.size),
          ),
        }
      }
      return {
        items: state.items.map((i) =>
          i.product.id === action.productId && i.size === action.size
            ? { ...i, quantity: action.qty }
            : i,
        ),
      }
    }

    case 'CLEAR_CART':
      return { items: [] }
  }
}

// ── Context ───────────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[]
  cartCount: number
  subtotal: number
  total: number
  addItem: (product: Product, size: string) => void
  removeItem: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, qty: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  const cartCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = state.items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  )
  const total = subtotal

  const value: CartContextValue = {
    items: state.items,
    cartCount,
    subtotal,
    total,
    addItem: (product, size) => dispatch({ type: 'ADD_ITEM', product, size }),
    removeItem: (productId, size) =>
      dispatch({ type: 'REMOVE_ITEM', productId, size }),
    updateQuantity: (productId, size, qty) =>
      dispatch({ type: 'UPDATE_QUANTITY', productId, size, qty }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// ── Hook ─────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
