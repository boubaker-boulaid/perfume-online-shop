// The admin's API calls, one function per endpoint in backend/docs/API.md ("Authentication"
// and "Admin endpoints"). Like services/api.ts, they go through http.ts and throw an ApiError.

import type { Paginated } from '../types'
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
