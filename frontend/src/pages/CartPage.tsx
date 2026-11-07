import { Link } from 'react-router'
import { TrashIcon } from '../components/Icons'
import { PageHeading } from '../components/PageHeading'
import { PillLink } from '../components/PillLink'
import { QuantityStepper } from '../components/QuantityStepper'
import { useCart } from '../context/cartContext'
import { formatPrice } from '../utils/format'

export function CartPage() {
  const { items, subtotal, setQuantity, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="container page">
        <PageHeading eyebrow="Votre panier" title={<>Votre panier est <em>vide</em></>}>
          Trouvez un parfum que vous aimerez, il apparaîtra ici.
        </PageHeading>
        <PillLink to="/shop">Découvrir la boutique</PillLink>
      </div>
    )
  }

  return (
    <div className="container page">
      <PageHeading eyebrow="Votre panier" title={<>Prêt à <em>commander&nbsp;?</em></>} />

      <div className="checkout-layout">
        <ul className="cart-list">
          {items.map((item) => (
            <li key={item.product_id} className="cart-item">
              <Link to={`/shop/${item.slug}`} className="cart-item__image">
                <img src={item.image_path} alt="" width={630} height={840} />
              </Link>
              <div className="cart-item__body">
                <div className="cart-item__top">
                  <Link to={`/shop/${item.slug}`} className="cart-item__name">
                    {item.name}
                  </Link>
                  <button type="button" className="icon-button" aria-label={`Retirer ${item.name}`} onClick={() => removeItem(item.product_id)}>
                    <TrashIcon size={16} />
                  </button>
                </div>
                <div className="cart-item__price">{formatPrice(item.price)}</div>
                <div className="cart-item__bottom">
                  <QuantityStepper value={item.quantity} max={Math.min(item.stock, 99)} label={`Quantité de ${item.name}`} onChange={(quantity) => setQuantity(item.product_id, quantity)} />
                  <strong>{formatPrice(Number(item.price) * item.quantity)}</strong>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="panel summary">
          <h2>Récapitulatif</h2>
          <div className="summary__row">
            <span>Sous-total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="summary__row">
            <span>Livraison</span>
            <span>Offerte</span>
          </div>
          <div className="summary__row summary__row--total">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Link to="/checkout" className="button button--accent button--block">
            Passer la commande
          </Link>
          <Link to="/shop" className="text-button summary__continue">
            Continuer mes achats
          </Link>
        </aside>
      </div>
    </div>
  )
}
