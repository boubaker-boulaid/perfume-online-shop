import { OfferCard, OfferCardSkeleton } from '../components/offers/OfferCard'
import { PageHeading } from '../components/PageHeading'
import { PillLink } from '../components/PillLink'
import { useApi } from '../hooks/useApi'
import { getOffers } from '../services/api'

export function OffersPage() {
  const { data: offers, error, loading } = useApi(getOffers, 'offers')

  return (
    <div className="container page">
      <PageHeading eyebrow="Promos" title={<>Les offres <em>du moment</em></>}>
        Des packs à petit prix, pour une durée limitée.
      </PageHeading>

      <div className="offer-grid">
        {loading && Array.from({ length: 4 }, (_, index) => <OfferCardSkeleton key={index} />)}
        {offers?.map((offer, index) => <OfferCard key={offer.id} offer={offer} index={index} />)}
      </div>

      {(Boolean(error) || offers?.length === 0) && (
        <div className="empty">
          <p>{error ? 'Impossible de charger les offres. Réessayez dans un instant.' : 'Pas d’offre en ce moment. Revenez bientôt\u00a0!'}</p>
          <PillLink to="/shop">Voir la boutique</PillLink>
        </div>
      )}
    </div>
  )
}
