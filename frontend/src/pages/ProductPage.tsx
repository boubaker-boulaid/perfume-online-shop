import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { BadgeCheckIcon, BagIcon, BanknoteIcon, CheckIcon, TruckIcon } from '../components/Icons'
import { ProductCard } from '../components/ProductCard'
import { QuantityStepper } from '../components/QuantityStepper'
import { useCart } from '../context/cartContext'
import { useApi } from '../hooks/useApi'
import { getProduct, getProducts } from '../services/api'
import type { Product } from '../types'
import { formatPrice } from '../utils/format'
import { NotFoundPage } from './NotFoundPage'

const LOW_STOCK = 5

function ProductDetails({ product }: { product: Product }) {
  const { items, addItem } = useCart()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const soldOut = product.stock === 0
  const notes = product.notes?.split(',').map((note) => note.trim()) ?? []

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const add = () => {
    addItem(product, quantity)
    setAdded(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 2000)
  }

  // Straight to the checkout, like an offer's "Commander". A perfume already in the bag isn't added twice.
  const order = () => {
    if (!items.some((item) => item.product_id === product.id)) addItem(product, quantity)
    navigate('/checkout')
  }

  return (
    <div className="product">
      <div className="product__image">
        <img src={product.image_path} alt={product.name} width={600} height={600} />
      </div>

      <div className="product__info">
        <div className="eyebrow">{product.category.name}</div>
        <h1 className="display-title">{product.name}</h1>

        <div className="product__price">
          {formatPrice(product.price)}
          {product.compare_at_price && <s>{formatPrice(product.compare_at_price)}</s>}
        </div>

        {product.description && <p className="product__description body-text">{product.description}</p>}

        {notes.length > 0 && (
          <div className="product__notes">
            <div className="field__label">Notes</div>
            <div className="product__note-list">
              {notes.map((note) => (
                <span key={note}>{note}</span>
              ))}
            </div>
          </div>
        )}

        <div className={`product__stock${soldOut ? ' is-out' : ''}`}>
          {soldOut ? 'Épuisé' : product.stock <= LOW_STOCK ? `Plus que ${product.stock} en stock` : 'En stock'}
        </div>

        {/* Fixed to the bottom of the screen on phones, so it's always in reach. */}
        <div className="buy-bar">
          {!soldOut && <QuantityStepper value={quantity} max={Math.min(product.stock, 99)} label="Quantité" onChange={setQuantity} />}
          {!soldOut && (
            // icon only on phones, to leave room for "Commander"
            <button type="button" className="button button--ghost buy-bar__add" aria-label={added ? 'Ajouté au panier' : 'Ajouter au panier'} onClick={add}>
              {added ? <CheckIcon size={16} /> : <BagIcon size={17} />} <span>{added ? 'Ajouté' : 'Ajouter au panier'}</span>
            </button>
          )}
          <button type="button" className="button button--accent buy-bar__button" disabled={soldOut} onClick={order}>
            {soldOut ? 'Épuisé' : 'Commander'}
          </button>
        </div>

        <ul className="product__facts">
          <li>
            <TruckIcon size={17} /> Livraison gratuite partout au Maroc
          </li>
          <li>
            <BanknoteIcon size={17} /> Paiement à la réception
          </li>
          {product.sku && (
            <li>
              <BadgeCheckIcon size={17} /> Réf. {product.sku}
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

export function ProductPage() {
  const { slug = '' } = useParams()
  const { data: product, error, loading } = useApi(() => getProduct(slug), slug)
  const { data: related } = useApi(() => getProducts({ category: product?.category.slug }), `related-${product?.id}`)

  if (error) return <NotFoundPage />

  return (
    <div className="container page">
      <Breadcrumbs
        trail={[
          { label: 'Boutique', to: '/shop' },
          ...(product ? [{ label: product.category.name, to: `/shop?category=${product.category.slug}` }, { label: product.name }] : []),
        ]}
      />

      {loading && <div className="product-skeleton skeleton" aria-label="Chargement" />}
      {product && <ProductDetails key={product.id} product={product} />}

      {product && Boolean(related?.data.filter((item) => item.id !== product.id).length) && (
        <section className="section related">
          <div className="section-bar">
            <h2>Vous aimerez aussi</h2>
          </div>
          <div className="best-sellers">
            {related?.data
              .filter((item) => item.id !== product.id)
              .slice(0, 4)
              .map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      )}
    </div>
  )
}
