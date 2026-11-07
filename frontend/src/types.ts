// These mirror the backend API responses (backend/docs/API.md).

export type Category = {
  id: number
  name: string
  slug: string
  description: string | null
  image_path: string | null
  is_active: boolean
  sort_order: number
  products_count?: number
}

export type Product = {
  id: number
  category_id: number
  name: string
  slug: string
  category: Category
  description: string | null
  notes: string | null
  sku: string | null
  price: string
  compare_at_price: string | null
  stock: number
  sort_order: number
  image_path: string
  is_active: boolean
  is_featured: boolean
  created_at: string
  // Shown in the design, but the backend doesn't have these yet.
  rating?: number
  reviews_count?: number
}

// The backend has no offers yet: this is what its endpoints would need to return.
export type Offer = {
  id: number
  slug: string
  title: string
  tagline: string
  description: string
  image_path: string
  starts_at: string
  ends_at: string
  terms: string[]
  products: Product[]
  max_discount_percent: number
  max_saving: string
}

export type Paginated<T> = {
  data: T[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export type ProductSort = 'newest' | 'oldest' | 'price_asc' | 'price_desc'

export type ProductFilters = {
  q?: string
  category?: string
  min_price?: string
  max_price?: string
  sort?: ProductSort
  page?: number
}

export type OrderPayload = {
  customer_name: string
  phone: string
  email: string
  city: string
  address: string
  note?: string
  idempotency_key: string
  items: { product_id: number; quantity: number }[]
}

export type PlacedOrder = {
  order_number: string
  total: string
  whatsapp_link: string
  whatsapp_opened_url: string
}

export type CartItem = {
  product_id: number
  slug: string
  name: string
  price: string
  image_path: string
  stock: number
  quantity: number
}
