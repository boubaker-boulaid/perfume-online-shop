// FAKE API: nothing here talks to the backend yet.
//
// Each function has the same name, inputs and outputs as a real endpoint in
// backend/docs/API.md, including its rules and errors. To connect the backend,
// replace the insides of this file. The pages and components don't need to change.

import { categories } from '../data/categories'
import { offers, type OfferSeed } from '../data/offers'
import { products } from '../data/products'
import type { Category, Offer, OrderPayload, Paginated, PlacedOrder, Product, ProductFilters } from '../types'
import { discountPercent, formatPrice } from '../utils/format'

const PER_PAGE = 10
const FAKE_WHATSAPP_NUMBER = '212600000000'

export class ApiError extends Error {
  status: number
  errors: Record<string, string[]> | null

  constructor(message: string, status: number, errors: Record<string, string[]> | null = null) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

// a short delay, so loading states can be seen working
const respond = <T>(value: () => T): Promise<T> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(value())
      } catch (error) {
        reject(error)
      }
    }, 150)
  })

const activeProducts = () => products.filter((product) => product.is_active && product.category.is_active)
// An offer's set is only sold from the offer's page, so the shop doesn't list it.
const visibleProducts = () => activeProducts().filter((product) => !product.is_offer)

// GET /api/v1/categories
export function getCategories(): Promise<Category[]> {
  return respond(() =>
    categories
      .filter((category) => category.is_active)
      .map((category) => ({
        ...category,
        products_count: visibleProducts().filter((product) => product.category_id === category.id).length,
      })),
  )
}

// GET /api/v1/products
export function getProducts(filters: ProductFilters = {}): Promise<Paginated<Product>> {
  return respond(() => {
    const search = filters.q?.trim().toLowerCase()
    const hasMin = filters.min_price !== undefined && filters.min_price !== ''
    const hasMax = filters.max_price !== undefined && filters.max_price !== ''

    const matching = visibleProducts().filter(
      (product) =>
        (!search || product.name.toLowerCase().includes(search)) &&
        (!filters.category || product.category.slug === filters.category) &&
        (!hasMin || Number(product.price) >= Number(filters.min_price)) &&
        (!hasMax || Number(product.price) <= Number(filters.max_price)),
    )

    const sorted = [...matching].sort((a, b) => {
      switch (filters.sort) {
        case 'price_asc':
          return Number(a.price) - Number(b.price)
        case 'price_desc':
          return Number(b.price) - Number(a.price)
        case 'newest':
          return b.created_at.localeCompare(a.created_at)
        case 'oldest':
          return a.created_at.localeCompare(b.created_at)
        default:
          return a.sort_order - b.sort_order
      }
    })

    const lastPage = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
    const page = Math.min(Math.max(1, filters.page ?? 1), lastPage)

    return {
      data: sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE),
      meta: { current_page: page, per_page: PER_PAGE, total: sorted.length, last_page: lastPage },
    }
  })
}

// GET /api/v1/products/featured
export function getFeaturedProducts(): Promise<Product[]> {
  return respond(() => visibleProducts().filter((product) => product.is_featured).slice(0, 5))
}

// GET /api/v1/products/{slug}
export function getProduct(slug: string): Promise<Product> {
  return respond(() => {
    const product = visibleProducts().find((item) => item.slug === slug)

    if (!product) throw new ApiError('La ressource demandée est introuvable.', 404)

    return product
  })
}

function toOffer({ product_slugs, free_product_slug, ...offer }: OfferSeed): Offer {
  const set = activeProducts().find((product) => product.is_offer && product.slug === offer.slug)
  if (!set) throw new Error(`The offer ${offer.slug} has no set`)

  const offerProducts = visibleProducts().filter((product) => product_slugs.includes(product.slug))
  const freeProduct = visibleProducts().find((product) => product.slug === free_product_slug) ?? null
  const regularPrice = [...offerProducts, ...(freeProduct ? [freeProduct] : [])].reduce((sum, product) => sum + Number(product.price), 0)

  return {
    ...offer,
    set,
    products: offerProducts,
    free_product: freeProduct,
    regular_price: regularPrice.toFixed(2),
    saving: (regularPrice - Number(set.price)).toFixed(2),
    discount_percent: discountPercent(set.price, regularPrice.toFixed(2)),
  }
}

// Started, not over yet, and with something left to sell.
const currentOffers = () => {
  const now = new Date().toISOString()

  return offers
    .filter((offer) => offer.starts_at <= now && now <= offer.ends_at)
    .map(toOffer)
    .filter((offer) => offer.products.length > 0)
}

// GET /api/v1/offers (doesn't exist in the backend yet)
export function getOffers(): Promise<Offer[]> {
  return respond(currentOffers)
}

// GET /api/v1/offers/{slug} (doesn't exist in the backend yet)
export function getOffer(slug: string): Promise<Offer> {
  return respond(() => {
    const offer = currentOffers().find((item) => item.slug === slug)

    if (!offer) throw new ApiError('La ressource demandée est introuvable.', 404)

    return offer
  })
}

const placedOrders = new Map<string, PlacedOrder>()
const MOROCCAN_PHONE = /^(?:\+212|00212|0)[5-7][0-9]{8}$/

function validateOrder(payload: OrderPayload): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  const phone = payload.phone.replace(/[\s().-]/g, '')

  if (!payload.customer_name.trim()) errors.customer_name = ['Veuillez saisir votre nom.']
  if (!MOROCCAN_PHONE.test(phone)) errors.phone = ['Veuillez saisir un numéro de téléphone marocain valide.']
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errors.email = ['Veuillez saisir une adresse e-mail valide.']
  if (!payload.city.trim()) errors.city = ['Veuillez saisir votre ville.']
  if (!payload.address.trim()) errors.address = ['Veuillez saisir votre adresse.']
  if (payload.items.length === 0) errors.items = ['Votre panier est vide.']

  return errors
}

// POST /api/v1/orders
export function placeOrder(payload: OrderPayload): Promise<PlacedOrder> {
  return respond(() => {
    // a retry with the same key gets the same order back, and never a second one
    const existing = placedOrders.get(payload.idempotency_key)
    if (existing) return existing

    const errors = validateOrder(payload)
    if (Object.keys(errors).length > 0) throw new ApiError('Les données saisies ne sont pas valides.', 422, errors)

    // like the backend, prices come from the catalog and never from the browser
    const lines = payload.items.map((item) => {
      const product = activeProducts().find((candidate) => candidate.id === item.product_id)

      if (!product) throw new ApiError('Un produit de votre panier n’est plus disponible.', 422)
      if (product.stock < item.quantity) {
        throw new ApiError(`Stock insuffisant pour ${product.name}. Quantité demandée\u00a0: ${item.quantity}, quantité disponible\u00a0: ${product.stock}.`, 400)
      }

      return { product, quantity: item.quantity, total: Number(product.price) * item.quantity }
    })

    const total = lines.reduce((sum, line) => sum + line.total, 0)

    const message = [
      'Nouvelle commande',
      '',
      ...lines.map((line) => `${line.product.name}${line.product.is_offer ? ` (${line.product.description})` : ''} : quantité ${line.quantity} / prix ${formatPrice(line.total)}`),
      '',
      'Livraison : offerte',
      `Total : ${formatPrice(total)}`,
      `Nom : ${payload.customer_name}`,
      `Ville : ${payload.city}`,
      `Adresse : ${payload.address}`,
      ...(payload.note ? [payload.note] : []),
    ].join('\n')

    const order: PlacedOrder = {
      total: total.toFixed(2),
      whatsapp_link: `https://wa.me/${FAKE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      whatsapp_opened_url: `/api/v1/orders/${payload.idempotency_key}/whatsapp-opened`,
    }

    placedOrders.set(payload.idempotency_key, order)

    return order
  })
}

// PATCH /api/v1/orders/{orderKey}/whatsapp-opened
export function markWhatsappOpened(url: string): Promise<void> {
  void url // the real version sends a PATCH to this signed url

  return respond(() => undefined)
}
