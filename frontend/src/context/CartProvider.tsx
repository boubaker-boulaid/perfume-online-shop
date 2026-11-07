import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '../types'
import { CartContext, type CartContextValue } from './cartContext'

const STORAGE_KEY = 'lume-cart'
const MAX_QUANTITY = 99 // the API's limit per order line

function readCart(): CartItem[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')

    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

const limit = (quantity: number, stock: number) => Math.max(1, Math.min(quantity, stock, MAX_QUANTITY))

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCart)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // private browsing can block storage: the bag still works until the page closes
    }
  }, [items])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
      addItem: (product: Product, quantity: number) =>
        setItems((current) => {
          const existing = current.find((item) => item.product_id === product.id)

          if (existing) {
            return current.map((item) =>
              item === existing ? { ...item, quantity: limit(item.quantity + quantity, product.stock) } : item,
            )
          }

          return [
            ...current,
            {
              product_id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image_path: product.image_path,
              stock: product.stock,
              quantity: limit(quantity, product.stock),
              ...(product.is_offer && { offer_contents: product.description ?? '' }),
            },
          ]
        }),
      setQuantity: (productId, quantity) =>
        setItems((current) =>
          current.map((item) =>
            item.product_id === productId ? { ...item, quantity: limit(quantity, item.stock) } : item,
          ),
        ),
      removeItem: (productId) => setItems((current) => current.filter((item) => item.product_id !== productId)),
      clear: () => setItems([]),
    }),
    [items],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
