import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { useReveal } from '../hooks/useReveal'
import type { Product } from '../types'
import { formatPrice } from '../utils/format'
import { HeartIcon } from './Icons'
import { Stars } from './Stars'

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const ref = useReveal<HTMLElement>()
  const [liked, setLiked] = useState(false)
  const soldOut = product.stock === 0

  return (
    <article ref={ref} className="product-card reveal" style={{ '--reveal-delay': `${(index % 5) * 130}ms` } as CSSProperties}>
      <button
        type="button"
        className={`product-card__like${liked ? ' is-liked' : ''}`}
        aria-label={liked ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
        aria-pressed={liked}
        onClick={() => setLiked(!liked)}
      >
        <HeartIcon filled={liked} />
      </button>

      <Link to={`/shop/${product.slug}`} className="product-card__link">
        <div className="product-card__image">
          <img src={product.image_path} alt={product.name} width={600} height={600} loading="lazy" />
          {soldOut && <span className="product-card__badge">Épuisé</span>}
        </div>
        <h3 className="product-card__name">{product.name}</h3>
        <div className="product-card__price">
          {formatPrice(product.price)}
          {product.compare_at_price && <s>{formatPrice(product.compare_at_price)}</s>}
        </div>
        <Stars rating={product.rating} reviews={product.reviews_count} />
      </Link>
    </article>
  )
}

export function ProductCardSkeleton() {
  return <div className="product-card product-card--skeleton" aria-hidden="true" />
}
