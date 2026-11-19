// The shop's API calls, one function per endpoint in backend/docs/API.md. They go through axios
// (http.ts) to the Laravel backend. Each one gives back the data the pages need, or throws an
// ApiError with a French message.

import type { Category, Offer, OrderPayload, Paginated, PlacedOrder, Product, ProductFilters } from '../types'
import { ApiError } from './apiError'
import { request } from './http'

export { ApiError }

// Empty filters are left out of the URL: the backend rejects an empty "category" or price.
const withoutEmpty = (params: object) => Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''))

// GET /api/v1/categories
export async function getCategories(): Promise<Category[]> {
  const { data } = await request<Category[]>({ method: 'get', url: '/api/v1/categories' })
  return data
}

// GET /api/v1/products
export async function getProducts(filters: ProductFilters = {}): Promise<Paginated<Product>> {
  const { data, meta } = await request<Product[]>({ method: 'get', url: '/api/v1/products', params: withoutEmpty(filters) })

  if (!meta) throw new ApiError('La liste des parfums n’a pas pu être lue.', 500)

  return { data, meta }
}

// GET /api/v1/products/featured
export async function getFeaturedProducts(): Promise<Product[]> {
  const { data } = await request<Product[]>({ method: 'get', url: '/api/v1/products/featured' })
  return data
}

// GET /api/v1/products/{slug}
export async function getProduct(slug: string): Promise<Product> {
  const { data } = await request<Product>({ method: 'get', url: `/api/v1/products/${encodeURIComponent(slug)}` })
  return data
}

// GET /api/v1/offers
export async function getOffers(): Promise<Offer[]> {
  const { data } = await request<Offer[]>({ method: 'get', url: '/api/v1/offers' })
  return data
}

// GET /api/v1/offers/{slug}
export async function getOffer(slug: string): Promise<Offer> {
  const { data } = await request<Offer>({ method: 'get', url: `/api/v1/offers/${encodeURIComponent(slug)}` })
  return data
}

// POST /api/v1/orders
export async function placeOrder(payload: OrderPayload): Promise<PlacedOrder> {
  const { data } = await request<PlacedOrder>({ method: 'post', url: '/api/v1/orders', data: payload })
  return data
}

// PATCH /api/v1/orders/{orderKey}/whatsapp-opened, at the signed address the order gave.
// It only saves the shop a reminder e-mail, so a failure is ignored: the customer has already
// gone to WhatsApp and there's nothing they could do about it.
export async function markWhatsappOpened(url: string): Promise<void> {
  try {
    await request<null>({ method: 'patch', url })
  } catch {
    // nothing to show the customer
  }
}
