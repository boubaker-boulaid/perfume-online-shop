// The admin's API calls, one function per endpoint in backend/docs/API.md ("Authentication"
// and "Admin endpoints"). Like services/api.ts, they go through http.ts and throw an ApiError.

import type { Category, Offer, Paginated, Product, ProductFilters } from '../types'
import { ApiError } from '../services/apiError'
import { request, send } from '../services/http'
import type { Admin, Order, OrderFilters, OrderStatus, Stats } from './types'

// Empty filters are left out of the URL: the backend rejects an empty "status" or "sort".
const withoutEmpty = (params: object) => Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''))

// POST /login: answers 204 and starts the session cookie. Nothing is stored in JavaScript.
export async function login(email: string, password: string, remember: boolean): Promise<void> {
  await send<void>({ method: 'post', url: '/login', data: { email, password, remember } })
}

// POST /logout
export async function logout(): Promise<void> {
  await send<void>({ method: 'post', url: '/logout' })
}

// GET /api/v1/admin/me: not wrapped in the usual envelope (API.md says so)
export function getMe(): Promise<Admin> {
  return send<Admin>({ method: 'get', url: '/api/v1/admin/me' })
}

// GET /api/v1/admin/stats
export async function getStats(): Promise<Stats> {
  const { data } = await request<Stats>({ method: 'get', url: '/api/v1/admin/stats' })
  return data
}

// GET /api/v1/admin/orders
export async function getOrders(filters: OrderFilters): Promise<Paginated<Order>> {
  const { data, meta } = await request<Order[]>({ method: 'get', url: '/api/v1/admin/orders', params: withoutEmpty(filters) })

  if (!meta) throw new ApiError('La liste des commandes n’a pas pu être lue.', 500)

  return { data, meta }
}

// GET /api/v1/admin/orders/{orderNumber}: with its status history
export async function getOrder(orderNumber: string): Promise<Order> {
  const { data } = await request<Order>({ method: 'get', url: `/api/v1/admin/orders/${encodeURIComponent(orderNumber)}` })
  return data
}

// PATCH /api/v1/admin/orders/{orderNumber}/status: gives back the order with its new history entry
export async function changeOrderStatus(orderNumber: string, status: OrderStatus, note?: string): Promise<Order> {
  const url = `/api/v1/admin/orders/${encodeURIComponent(orderNumber)}/status`
  const { data } = await request<Order>({ method: 'patch', url, data: { status, note } })
  return data
}

// Products, categories and offers are managed the same way, so the pattern is written once,
// with generics, and each resource gets short names below.

type Resource = 'products' | 'categories' | 'offers'

const url = (resource: Resource, slug?: string) => `/api/v1/admin/${resource}${slug ? `/${encodeURIComponent(slug)}` : ''}`

async function list<T>(resource: Resource, filters: object = {}): Promise<Paginated<T>> {
  const { data, meta } = await request<T[]>({ method: 'get', url: url(resource), params: withoutEmpty(filters) })

  if (!meta) throw new ApiError('La liste n’a pas pu être lue.', 500)

  return { data, meta }
}

// Every page, for the select boxes of a form (a shop has dozens of products, not thousands)
async function listAll<T>(resource: Resource): Promise<T[]> {
  const all: T[] = []
  let page = 1
  let lastPage: number

  // runs at least once: lastPage is only known once page 1 has arrived
  do {
    const result = await list<T>(resource, { page })
    all.push(...result.data)
    lastPage = result.meta.last_page
    page++
  } while (page <= lastPage)

  return all
}

async function show<T>(resource: Resource, slug: string): Promise<T> {
  const { data } = await request<T>({ method: 'get', url: url(resource, slug) })
  return data
}

// Creates without a slug, updates with one. Always POST with multipart/form-data, because PHP
// can't read files from a real PATCH: _method=PATCH tells Laravel it's an update (API.md).
async function save<T>(resource: Resource, form: FormData, slug?: string): Promise<T> {
  if (slug) form.set('_method', 'PATCH')

  const { data } = await request<T>({ method: 'post', url: url(resource, slug), data: form })
  return data
}

// Answers 204, with no body. 409 when the record is still in use (API.md).
async function remove(resource: Resource, slug: string): Promise<void> {
  await send<void>({ method: 'delete', url: url(resource, slug) })
}

export const getAdminProducts = (filters: ProductFilters) => list<Product>('products', filters)
export const getAllAdminProducts = () => listAll<Product>('products')
export const getAdminProduct = (slug: string) => show<Product>('products', slug)
export const saveProduct = (form: FormData, slug?: string) => save<Product>('products', form, slug)
export const deleteProduct = (slug: string) => remove('products', slug)

export const getAllAdminCategories = () => listAll<Category>('categories')
export const getAdminCategory = (slug: string) => show<Category>('categories', slug)
export const saveCategory = (form: FormData, slug?: string) => save<Category>('categories', form, slug)
export const deleteCategory = (slug: string) => remove('categories', slug)

export const getAdminOffers = (page: number) => list<Offer>('offers', { page })
export const getAdminOffer = (slug: string) => show<Offer>('offers', slug)
export const saveOffer = (form: FormData, slug?: string) => save<Offer>('offers', form, slug)
export const deleteOffer = (slug: string) => remove('offers', slug)

// POST /forgot-password: the same answer whether the account exists or not
export async function sendResetLink(email: string): Promise<void> {
  await send<unknown>({ method: 'post', url: '/forgot-password', data: { email } })
}

// POST /reset-password, with the token and e-mail from the link in the e-mail
export async function resetPassword(fields: { token: string; email: string; password: string; password_confirmation: string }): Promise<void> {
  await send<unknown>({ method: 'post', url: '/reset-password', data: fields })
}
