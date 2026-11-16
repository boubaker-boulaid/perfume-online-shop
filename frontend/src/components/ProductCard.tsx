import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router'
import { useCart } from '../context/cartContext'
import { useReveal } from '../hooks/useReveal'
import type { Product } from '../types'
import { discountPercent, formatDiscount, formatPrice } from '../utils/format'
import { BagIcon, CheckIcon } from './Icons'

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const ref = useReveal<HTMLElement>()
  const { items, addItem } = useCart()
  const navigate = useNavigate()
  const [added, setAdded] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const soldOut = product.stock === 0

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // The bag button adds one more each time, and shows a check for a moment.
  const add = () => {
    addItem(product, 1)
    setAdded(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 1500)
  }

  // "Commander" goes straight to the checkout. A perfume that's already in the bag isn't added twice.
  const order = () => {
    if (!items.some((item) => item.product_id === product.id)) addItem(product, 1)
    navigate('/checkout')
  }

  return (
    <article ref={ref} className="product-card reveal" style={{ '--reveal-delay': `${(index % 5) * 130}ms` } as CSSProperties}>
      <button
        type="button"
        className={`product-card__add${added ? ' is-added' : ''}`}
        aria-label={soldOut ? `${product.name}, épuisé` : `Ajouter ${product.name} au panier`}
        disabled={soldOut}
        onClick={add}
      >
        {added ? <CheckIcon size={17} /> : <BagIcon size={17} />}
      </button>

      <Link to={`/shop/${product.slug}`} className="product-card__link">
        <div className="product-card__image">
          <img src={product.image_path} alt={product.name} width={600} height={600} loading="lazy" />
          {soldOut ? (
            <span className="badge badge--dark product-card__badge">Épuisé</span>
          ) : (
            product.compare_at_price && <span className="badge product-card__badge">{formatDiscount(discountPercent(product.price, product.compare_at_price))}</span>
          )}
        </div>
        <p className="product-card__category">{product.category.name}</p>
        <h3 className="product-card__name">{product.name}</h3>
        <div className="product-card__price">
          {formatPrice(product.price)}
          {product.compare_at_price && <s>{formatPrice(product.compare_at_price)}</s>}
        </div>
      </Link>

      <button type="button" className="button button--accent button--small product-card__order" disabled={soldOut} aria-label={soldOut ? undefined : `Commander ${product.name}`} onClick={order}>
        {soldOut ? 'Épuisé' : 'Commander'}
      </button>
    </article>
  )
}

export function ProductCardSkeleton() {
  return <div className="product-card product-card--skeleton" aria-hidden="true" />
}
