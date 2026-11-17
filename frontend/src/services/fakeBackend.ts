// FAKE BACKEND: used when VITE_API_URL isn't set (see http.ts).
//
// It's an axios adapter: axios hands it each request instead of sending it over the network,
// and it answers like the Laravel backend would, with the same URLs, rules, errors, status codes
// and response shape as backend/docs/API.md. Its data comes from the files in src/data.

import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { categories } from '../data/categories'
import { offers, type OfferSeed } from '../data/offers'
import { products } from '../data/products'
import type { Offer, OrderPayload, PlacedOrder, ProductFilters } from '../types'
import { discountPercent, formatPrice } from '../utils/format'
import { WHATSAPP_NUMBER } from '../utils/whatsapp'
import { ApiError } from './apiError'

const PER_PAGE = 10
const NOT_FOUND = 'La ressource demandée est introuvable.'

type Answer = { status: number; message: string; data: unknown; meta?: unknown }

const ok = (data: unknown, message: string, status = 200): Answer => ({ status, message, data })

// Reads like the real catalog: hidden products and categories don't exist for customers.
const activeProducts = () => products.filter((product) => product.is_active && product.category.is_active)
// An offer's set is only sold from the offer's page, so the shop doesn't list it.
const visibleProducts = () => activeProducts().filter((product) => !product.is_offer)

function paginate<T>(items: T[], requestedPage: number, message: string): Answer {
  const lastPage = Math.max(1, Math.ceil(items.length / PER_PAGE))
  const page = Math.min(Math.max(1, requestedPage), lastPage)

  return {
    status: 200,
    message,
    data: items.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    meta: { current_page: page, per_page: PER_PAGE, total: items.length, last_page: lastPage },
  }
}

// GET /api/v1/categories
function listCategories(): Answer {
  const active = categories
    .filter((category) => category.is_active)
    .map((category) => ({
      ...category,
      products_count: visibleProducts().filter((product) => product.category_id === category.id).length,
    }))

  return paginate(active, 1, 'Catégories récupérées.')
}

// GET /api/v1/products
function listProducts(filters: ProductFilters): Answer {
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

  return paginate(sorted, Number(filters.page ?? 1), 'Produits récupérés.')
}

// GET /api/v1/products/{slug}
function showProduct(slug: string): Answer {
  const product = visibleProducts().find((item) => item.slug === slug)
  if (!product) throw new ApiError(NOT_FOUND, 404)

  return ok(product, 'Produit récupéré.')
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

// GET /api/v1/offers/{slug}
function showOffer(slug: string): Answer {
  const offer = currentOffers().find((item) => item.slug === slug)
  if (!offer) throw new ApiError(NOT_FOUND, 404)

  return ok(offer, 'Offre récupérée.')
}

const placedOrders = new Map<string, PlacedOrder>()
const MOROCCAN_PHONE = /^(?:\+212|00212|0)[5-7][0-9]{8}$/

function validateOrder(payload: OrderPayload): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  const phone = payload.phone.replace(/[\s().-]/g, '')

  if (!payload.customer_name.trim()) errors.customer_name = ['Écrivez votre nom.']
  if (!MOROCCAN_PHONE.test(phone)) errors.phone = ['Ce numéro ne semble pas correct. Exemple : 06 12 34 56 78']
  // the e-mail is optional, so it's only checked when something was typed
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errors.email = ['Cette adresse e-mail ne semble pas correcte.']
  if (!payload.city.trim()) errors.city = ['Écrivez votre ville.']
  if (!payload.address.trim()) errors.address = ['Écrivez votre adresse.']
  if (payload.items.length === 0) errors.items = ['Votre panier est vide.']

  return errors
}

// POST /api/v1/orders
function placeOrder(payload: OrderPayload): Answer {
  // a retry with the same key gets the same order back (200), and never a second one
  const existing = placedOrders.get(payload.idempotency_key)
  if (existing) return ok(existing, 'La commande a bien été créée.')

  const errors = validateOrder(payload)
  if (Object.keys(errors).length > 0) throw new ApiError('Certaines informations ne sont pas correctes.', 422, errors)

  // like the backend, prices come from the catalog and never from the browser
  const lines = payload.items.map((item) => {
    const product = activeProducts().find((candidate) => candidate.id === item.product_id)

    if (!product) throw new ApiError('Un parfum de votre panier n’est plus disponible.', 422)
    if (product.stock < item.quantity) {
      throw new ApiError(`Il ne reste que ${product.stock} ${product.name} en stock (vous en avez demandé ${item.quantity}).`, 400)
    }

    return { product, quantity: item.quantity, total: Number(product.price) * item.quantity }
  })

  const total = lines.reduce((sum, line) => sum + line.total, 0)

  const message = [
    'Salam, je voudrais commander :',
    '',
    ...lines.map((line) => `${line.product.name}${line.product.is_offer ? ` (${line.product.description})` : ''} × ${line.quantity} : ${formatPrice(line.total)}`),
    '',
    'Livraison : gratuite',
    `Total : ${formatPrice(total)}`,
    `Nom : ${payload.customer_name}`,
    `Ville : ${payload.city}`,
    `Adresse : ${payload.address}`,
    ...(payload.note ? [payload.note] : []),
  ].join('\n')

  const order: PlacedOrder = {
    total: total.toFixed(2),
    whatsapp_link: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
    whatsapp_opened_url: `/api/v1/orders/${payload.idempotency_key}/whatsapp-opened`,
  }

  placedOrders.set(payload.idempotency_key, order)

  return ok(order, 'La commande a bien été créée.', 201)
}

// Finds the endpoint for a request, like the backend's routes.
function route(method: string, path: string, params: Record<string, unknown>, body: unknown): Answer {
  const match = (pattern: RegExp) => path.match(pattern)?.[1]
  let slug: string | undefined

  if (method === 'get' && path === '/api/v1/categories') return listCategories()
  if (method === 'get' && path === '/api/v1/products') return listProducts(params as ProductFilters)
  if (method === 'get' && path === '/api/v1/products/featured') return ok(visibleProducts().filter((product) => product.is_featured).slice(0, 5), 'Produits récupérés.')
  if (method === 'get' && (slug = match(/^\/api\/v1\/products\/([^/]+)$/))) return showProduct(decodeURIComponent(slug))
  if (method === 'get' && path === '/api/v1/offers') return ok(currentOffers(), 'Offres récupérées.')
  if (method === 'get' && (slug = match(/^\/api\/v1\/offers\/([^/]+)$/))) return showOffer(decodeURIComponent(slug))
  if (method === 'post' && path === '/api/v1/orders') return placeOrder(body as OrderPayload)
  if (method === 'patch' && match(/^\/api\/v1\/orders\/([^/]+)\/whatsapp-opened$/)) return { status: 204, message: '', data: null }

  throw new ApiError(NOT_FOUND, 404)
}

// a short delay, so loading states can be seen working
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const fakeBackend: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  await wait(150)

  const reply = (status: number, data: unknown): AxiosResponse => ({ data, status, statusText: '', headers: new AxiosHeaders(), config, request: null })

  try {
    const { pathname } = new URL(config.url ?? '/', window.location.origin)
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
    const answer = route((config.method ?? 'get').toLowerCase(), pathname, config.params ?? {}, body)

    if (answer.status === 204) return reply(204, '')

    return reply(answer.status, { success: true, message: answer.message, data: answer.data, ...(answer.meta ? { meta: answer.meta } : {}), errors: null })
  } catch (error) {
    // the same failed answer as the backend, which axios turns into an error
    const failure = error instanceof ApiError ? error : new ApiError('Erreur interne du serveur.', 500)
    const response = reply(failure.status, { success: false, message: failure.message, data: null, errors: failure.errors })

    throw new AxiosError(failure.message, AxiosError.ERR_BAD_REQUEST, config, null, response)
  }
}
