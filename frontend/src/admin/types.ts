// These mirror backend/docs/API.md, "Admin endpoints" and "Data objects".

export type Admin = {
  id: number
  name: string
  email: string
  is_admin: boolean
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'paid'

export type OrderItem = {
  order_id: number
  product_id: number | null // null once the product is deleted
  product_name: string
  unit_price: string
  line_total: string
  quantity: number
}

export type OrderHistoryEntry = {
  id: number
  from_status: OrderStatus
  to_status: OrderStatus
  note: string | null
  user_id: number | null // null when the system made the change
  changed_by: string | null
  created_at: string
}

export type Order = {
  id: number
  order_number: string
  customer_name: string
  phone: string
  email: string
  city: string
  address: string
  note: string | null
  items: OrderItem[]
  items_count: number
  history?: OrderHistoryEntry[] // only when showing one order
  subtotal: string
  shipping_cost: string
  total: string
  status: OrderStatus
  payment_status: PaymentStatus
  whatsapp_opened_at: string | null
  created_at: string
}

export type OrderSort = 'newest' | 'oldest' | 'total_desc' | 'total_asc'

export type OrderFilters = {
  q?: string
  status?: OrderStatus
  payment_status?: PaymentStatus
  city?: string
  date_from?: string
  date_to?: string
  sort?: OrderSort
  page?: number
}

// Each part can be null: if one part fails, the others still load (API.md)
export type Stats = {
  revenue_this_month: number | null
  orders_by_status: Record<OrderStatus, number> | null
  revenue_last_30_days: { date: string; revenue: number }[] | null
  top_products: { product_id: number; name: string; slug: string; stock: number; sold: number; revenue: number }[] | null
  low_stock: { id: number; name: string; slug: string; stock: number; is_active: boolean }[] | null
}
