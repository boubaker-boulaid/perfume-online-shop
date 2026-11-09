import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeftIcon, CheckIcon } from '../components/Icons'
import { ProductCard } from '../components/ProductCard'
import { QuantityStepper } from '../components/QuantityStepper'
import { Stars } from '../components/Stars'
import { useCart } from '../context/cartContext'
import { useApi } from '../hooks/useApi'
import { getProduct, getProducts } from '../services/api'
import type { Product } from '../types'
import { formatPrice } from '../utils/format'
import { NotFoundPage } from './NotFoundPage'

const LOW_STOCK = 5

function ProductDetails({ product }: { product: Product }) {
  const { addItem } = useCart()
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

  return (
    <div className="product">
      <div className="product__image">
        <img src={product.image_path} alt={product.name} width={600} height={600} />
      </div>

      <div className="product__info">
        <div className="eyebrow">{product.category.name}</div>
        <h1 className="display-title">{product.name}</h1>
        <Stars rating={product.rating} reviews={product.reviews_count} />

        <div className="product__price">
          {formatPrice(product.price)}
          {product.compare_at_price && <s>{formatPrice(product.compare_at_price)}</s>}
        </div>

        <p className="product__description">{product.description}</p>

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
          <button type="button" className="button button--accent buy-bar__button" disabled={soldOut} onClick={add}>
            {soldOut ? 'Épuisé' : added ? <>Ajouté <CheckIcon size={16} /></> : 'Ajouter au panier'}
          </button>
        </div>

        <ul className="product__facts">
          <li>Livraison gratuite partout au Maroc</li>
          <li>Paiement à la réception</li>
          {product.sku && <li>Réf. {product.sku}</li>}
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
      <Link to="/shop" className="back-link">
        <ArrowLeftIcon size={15} strokeWidth={1.6} /> Retour à la boutique
      </Link>

      {loading && <div className="product-skeleton" aria-label="Chargement" />}
      {product && <ProductDetails key={product.id} product={product} />}

      {product && Boolean(related?.data.filter((item) => item.id !== product.id).length) && (
        <section className="section">
          <div className="section-bar">
            <h2>Vous aimerez aussi</h2>
          </div>
          <div className="best-sellers">
            {related?.data
              .filter((item) => item.id !== product.id)
              .slice(0, 4)
              .map((item, index) => <ProductCard key={item.id} product={item} index={index} />)}
          </div>
        </section>
      )}
    </div>
  )
}
