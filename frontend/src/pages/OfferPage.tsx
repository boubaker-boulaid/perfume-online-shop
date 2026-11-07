import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeftIcon, BagIcon, CalendarIcon, CheckIcon, ClockIcon } from '../components/Icons'
import { ProductCard } from '../components/ProductCard'
import { useCart } from '../context/cartContext'
import { useApi } from '../hooks/useApi'
import { getOffer } from '../services/api'
import type { Offer } from '../types'
import { formatDate, formatDiscount, formatPrice, formatTimeLeft } from '../utils/format'
import { NotFoundPage } from './NotFoundPage'

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

function OfferDetails({ offer }: { offer: Offer }) {
  const { items, addItem } = useCart()
  const navigate = useNavigate()

  // A sold-out perfume stays on the page, but isn't part of the order or its total.
  const available = offer.products.filter((product) => product.stock > 0)
  const soldOut = offer.products.filter((product) => product.stock === 0)
  const missing = available.filter((product) => !items.some((item) => item.product_id === product.id))
  const inCart = available.length > 0 && missing.length === 0
  const total = sum(available.map((product) => Number(product.price)))
  const oldTotal = sum(available.map((product) => Number(product.compare_at_price)))

  // Only adds what isn't in the bag yet, so ordering again never doubles a bottle.
  const addOffer = () => missing.forEach((product) => addItem(product, 1))

  const orderOffer = () => {
    addOffer()
    navigate('/checkout')
  }

  return (
    <>
      <div className="offer">
        <div className="offer__image">
          <img src={offer.image_path} alt={`Parfums de l’offre ${offer.title}`} width={1200} height={750} />
          <span className="offer-badge">{formatDiscount(offer.max_discount_percent)}</span>
        </div>

        <div className="offer__info">
          <div className="eyebrow">Offre spéciale</div>
          <h1 className="display-title">{offer.title}</h1>
          <p className="offer__saving">Économisez jusqu’à {formatPrice(offer.max_saving)}</p>
          <p className="offer__description">{offer.description}</p>
          <ul className="offer__dates">
            <li>
              <ClockIcon size={16} /> {formatTimeLeft(offer.ends_at)}
            </li>
            <li>
              <CalendarIcon size={16} /> Jusqu’au {formatDate(offer.ends_at)}
            </li>
          </ul>

          {available.length > 0 && (
            <div className="offer__total">
              <span>
                Prix de l’offre, {available.length} parfum{available.length > 1 ? 's' : ''}
              </span>
              <strong>
                {formatPrice(total)} <s>{formatPrice(oldTotal)}</s>
              </strong>
              {soldOut.length > 0 && (
                <p className="offer__note">Épuisé, non inclus : {soldOut.map((product) => product.name).join(', ')}</p>
              )}
            </div>
          )}

          {/* Fixed to the bottom of the screen on phones, like on the product page. */}
          <div className="buy-bar">
            {inCart ? (
              <Link to="/cart" className="button button--ghost offer__add" aria-label="Offre dans le panier, voir le panier">
                <CheckIcon size={16} /> <span>Voir le panier</span>
              </Link>
            ) : (
              available.length > 0 && (
                <button type="button" className="button button--ghost offer__add" aria-label="Ajouter l’offre au panier" onClick={addOffer}>
                  <BagIcon size={17} /> <span>Ajouter au panier</span>
                </button>
              )
            )}
            <button type="button" className="button button--accent buy-bar__button" disabled={available.length === 0} onClick={orderOffer}>
              {available.length > 0 ? `Commander l’offre · ${formatPrice(total)}` : 'Offre épuisée'}
            </button>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="section-bar">
          <h2>Les parfums de cette offre</h2>
        </div>
        <div className="product-grid">
          {offer.products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
        </div>
      </section>

      <section className="section">
        <div className="panel offer__terms">
          <h2>Conditions de l’offre</h2>
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
        <ArrowLeftIcon size={15} strokeWidth={1.6} /> Retour aux offres
      </Link>

      {loading && <div className="product-skeleton" aria-label="Chargement" />}
      {offer && <OfferDetails key={offer.id} offer={offer} />}
    </div>
  )
}
