import { OfferCard, OfferCardSkeleton } from '../components/offers/OfferCard'
import { PageHeading } from '../components/PageHeading'
import { PillLink } from '../components/PillLink'
import { useApi } from '../hooks/useApi'
import { getOffers } from '../services/api'

export function OffersPage() {
  const { data: offers, error, loading } = useApi(getOffers, 'offers')

  return (
    <div className="container page">
      <PageHeading eyebrow="Offres spéciales" title="Nos offres du moment">
        Des parfums choisis à prix réduit, pour un temps limité. Choisissez une offre pour tout savoir.
      </PageHeading>

      <div className="offer-grid">
        {loading && Array.from({ length: 4 }, (_, index) => <OfferCardSkeleton key={index} />)}
        {offers?.map((offer, index) => <OfferCard key={offer.id} offer={offer} index={index} />)}
      </div>

      {(Boolean(error) || offers?.length === 0) && (
        <div className="empty">
          <p>{error ? 'Impossible de charger les offres pour le moment.' : 'Aucune offre en ce moment. Revenez bientôt !'}</p>
          <PillLink to="/shop">Voir la boutique</PillLink>
        </div>
      )}
    </div>
  )
}
