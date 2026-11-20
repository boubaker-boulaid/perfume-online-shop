import type { OrderSort, OrderStatus, PaymentStatus } from './types'

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Non payée',
  paid: 'Payée',
}

export const ORDER_SORT_LABELS: Record<OrderSort, string> = {
  newest: 'Plus récentes',
  oldest: 'Plus anciennes',
  total_desc: 'Total : du plus grand au plus petit',
  total_asc: 'Total : du plus petit au plus grand',
}

// The only moves the backend accepts (API.md, "Orders")
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

// 0612345678, +212612345678 and 00212612345678 all become 212612345678, for wa.me links.
// The backend already removed the spaces when the order was placed.
export const whatsappNumber = (phone: string): string => phone.replace(/^(\+|00)/, '').replace(/^0/, '212')
