import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeftIcon, BagIcon, CalendarIcon, CheckIcon, ClockIcon } from '../components/Icons'
import { ProductCard } from '../components/ProductCard'
import { useCart } from '../context/cartContext'
import { useApi } from '../hooks/useApi'
import { getOffer } from '../services/api'
import type { Offer } from '../types'
import { formatDate, formatDiscount, formatPrice, formatTimeLeft } from '../utils/format'
import { NotFoundPage } from './NotFoundPage'

function OfferDetails({ offer }: { offer: Offer }) {
  const { items, addItem } = useCart()
  const navigate = useNavigate()

  // A set is sold whole: if one perfume runs out, the set can't be ordered.
  const included = [...offer.products, ...(offer.free_product ? [offer.free_product] : [])]
  const soldOut = included.filter((product) => product.stock === 0)
  const available = offer.set.stock > 0 && soldOut.length === 0
  const inCart = items.some((item) => item.product_id === offer.set.id)
  const price = formatPrice(offer.set.price)

  // Ordering again never adds a second set.
  const addOffer = () => {
    if (!inCart) addItem(offer.set, 1)
  }

  const orderOffer = () => {
    addOffer()
    navigate('/checkout')
  }

  return (
    <>
      <div className="offer">
        <div className="offer__image">
          <img src={offer.image_path} alt={`Parfums de l’offre ${offer.title}`} width={900} height={1200} />
          <span className="offer-badge">{formatDiscount(offer.discount_percent)}</span>
        </div>

        <div className="offer__info">
          <div className="eyebrow">Promo</div>
          <h1 className="display-title">{offer.title}</h1>
          <p className="offer__saving">Vous économisez {formatPrice(offer.saving)}</p>
          <p className="offer__description">{offer.description}</p>
          <ul className="offer__dates">
            <li>
              <ClockIcon size={16} /> {formatTimeLeft(offer.ends_at)}
            </li>
            <li>
              <CalendarIcon size={16} /> Jusqu’au {formatDate(offer.ends_at)}
            </li>
          </ul>

          <div className="offer__total">
            <span>
              Prix du pack, {offer.products.length} parfums{offer.free_product && ' + 1 offert'}
            </span>
            <strong>
              {price} <s>{formatPrice(offer.regular_price)}</s>
            </strong>
            {soldOut.length > 0 && <p className="offer__note">Épuisé : {soldOut.map((product) => product.name).join(', ')}</p>}
          </div>

          {/* Fixed to the bottom of the screen on phones, like on the product page. */}
          <div className="buy-bar">
            {inCart ? (
              <Link to="/cart" className="button button--ghost offer__add" aria-label="Offre dans le panier, voir le panier">
                <CheckIcon size={16} /> <span>Voir le panier</span>
              </Link>
            ) : (
              available && (
                <button type="button" className="button button--ghost offer__add" aria-label="Ajouter l’offre au panier" onClick={addOffer}>
                  <BagIcon size={17} /> <span>Ajouter au panier</span>
                </button>
              )
            )}
            <button type="button" className="button button--accent buy-bar__button" disabled={!available} aria-label={available ? `Commander l’offre, ${price}` : undefined} onClick={orderOffer}>
              {available ? `Commander · ${price}` : 'Pack épuisé'}
            </button>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="section-bar">
          <h2>Les parfums du pack</h2>
        </div>
        <div className="product-grid">
          {offer.products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
        </div>
      </section>

      {offer.free_product && (
        <section className="section">
          <div className="section-bar">
            <h2>Votre parfum offert</h2>
          </div>
          <div className="product-grid">
            <ProductCard product={offer.free_product} />
          </div>
        </section>
      )}

      <section className="section">
        <div className="panel offer__terms">
          <h2>Conditions</h2>
          <ul>
            {offer.terms.map((term) => <li key={term}>{term}</li>)}
          </ul>
        </div>
      </section>
    </>
  )
}

export function OfferPage() {
  const { slug = '' } = useParams()
  const { data: offer, error, loading } = useApi(() => getOffer(slug), slug)

  if (error) return <NotFoundPage />

  return (
    <div className="container page">
      <Link to="/offers" className="back-link">
        <ArrowLeftIcon size={15} strokeWidth={1.6} /> Retour aux promos
      </Link>

      {loading && <div className="product-skeleton" aria-label="Chargement" />}
      {offer && <OfferDetails key={offer.id} offer={offer} />}
    </div>
  )
}
