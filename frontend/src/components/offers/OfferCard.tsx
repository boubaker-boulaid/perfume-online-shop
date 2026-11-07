import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { useReveal } from '../../hooks/useReveal'
import type { Offer } from '../../types'
import { formatDiscount, formatTimeLeft } from '../../utils/format'
import { ArrowRightIcon, ClockIcon } from '../Icons'

export function OfferCard({ offer, index = 0 }: { offer: Offer; index?: number }) {
  const ref = useReveal<HTMLElement>()

  return (
    <article ref={ref} className="offer-card reveal" style={{ '--reveal-delay': `${(index % 2) * 130}ms` } as CSSProperties}>
      <Link to={`/offers/${offer.slug}`} className="offer-card__link">
        <div className="offer-card__image">
          <img src={offer.image_path} alt="" width={1200} height={750} loading="lazy" />
          <span className="offer-badge">{formatDiscount(offer.max_discount_percent)}</span>
        </div>
        <div className="offer-card__body">
          <h2 className="offer-card__title">{offer.title}</h2>
          <p className="offer-card__tagline">{offer.tagline}</p>
          <div className="offer-card__footer">
            <span className="offer-time">
              <ClockIcon size={15} /> {formatTimeLeft(offer.ends_at)}
            </span>
            <span className="offer-card__more">
              Voir l’offre <ArrowRightIcon size={15} strokeWidth={1.7} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

export function OfferCardSkeleton() {
  return <div className="offer-card offer-card--skeleton" aria-hidden="true" />
}
