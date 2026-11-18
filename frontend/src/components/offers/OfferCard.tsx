import { Link } from 'react-router'
import { useCardReveal } from '../../motion/useScrollReveal'
import type { Offer } from '../../types'
import { formatDiscount, formatTimeLeft } from '../../utils/format'
import { ArrowRightIcon, ClockIcon } from '../Icons'

export function OfferCard({ offer }: { offer: Offer }) {
  const ref = useCardReveal<HTMLElement>()

  return (
    <article ref={ref} className="offer-card">
      <Link to={`/offers/${offer.slug}`} className="offer-card__link">
        <div className="offer-card__image">
          <img src={offer.image_path} alt="" width={900} height={1200} loading="lazy" />
        </div>
        <div className="offer-card__body">
          <span className="offer-badge">{formatDiscount(offer.discount_percent)}</span>
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
