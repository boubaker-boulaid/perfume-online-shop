import { createContext, useContext } from 'react'
import type { CartItem, Product } from '../types'

export type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  addItem: (product: Product, quantity: number) => void
  setQuantity: (productId: number, quantity: number) => void
  removeItem: (productId: number) => void
  clear: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const cart = useContext(CartContext)

  if (!cart) throw new Error('useCart must be used inside CartProvider')

  return cart
}
