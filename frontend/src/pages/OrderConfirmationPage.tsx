import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { CheckIcon } from '../components/Icons'
import { markWhatsappOpened } from '../services/api'
import type { PlacedOrder } from '../types'
import { formatPrice } from '../utils/format'

export function OrderConfirmationPage() {
  const order = (useLocation().state as { order?: PlacedOrder } | null)?.order
  const [opened, setOpened] = useState(false)

  if (!order) return <Navigate to="/shop" replace />

  return (
    <div className="container page confirmation">
      <span className="confirmation__icon">
        <CheckIcon size={26} />
      </span>
      <div className="eyebrow">Presque terminé</div>
      <h1 className="display-title">
        Une dernière étape, <em>sur WhatsApp</em>
      </h1>
      <p className="confirmation__text">Vos articles sont réservés. Envoyez-nous votre commande sur WhatsApp pour la confirmer. Les commandes non envoyées sous 1 heure sont annulées automatiquement.</p>

      <div className="panel confirmation__summary">
        <div className="summary__row">
          <span>Numéro de commande</span>
          <strong>{order.order_number}</strong>
        </div>
        <div className="summary__row">
          <span>Total, à payer à la livraison</span>
          <strong>{formatPrice(order.total)}</strong>
        </div>
      </div>

      <a
        className="button button--accent button--block confirmation__action"
        href={order.whatsapp_link}
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          setOpened(true)
          void markWhatsappOpened(order.whatsapp_opened_url)
        }}
      >
        {opened ? 'Rouvrir WhatsApp' : 'Envoyer ma commande sur WhatsApp'}
      </a>
      {opened && (
        <p className="confirmation__note" role="status">
          Merci. Nous confirmerons votre commande et organiserons la livraison avec vous.
        </p>
      )}
      <Link to="/shop" className="text-button">
        Retour à la boutique
      </Link>
    </div>
  )
}
