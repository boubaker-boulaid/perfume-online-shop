import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeftIcon } from '../../components/Icons'
import { useApi } from '../../hooks/useApi'
import { ApiError } from '../../services/apiError'
import { formatPrice } from '../../utils/format'
import { changeOrderStatus, getOrder } from '../adminApi'
import { NEXT_STATUSES, PAYMENT_LABELS, STATUS_LABELS, whatsappNumber } from '../labels'
import type { OrderStatus } from '../types'
import { PageTitle } from '../../components/PageTitle'

// "2026-11-20T14:05:00.000Z" → "20 novembre 2026 à 15:05", in the admin's time zone
const formatDateTime = (iso: string) => new Intl.DateTimeFormat('fr-MA', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(iso))

export function OrderPage() {
  const { orderNumber = '' } = useParams()
  const [version, setVersion] = useState(0)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  // a new version is a new key: useApi loads the order again
  const { data: order, error } = useApi(() => getOrder(orderNumber), `${orderNumber}-${version}`)

  if (error) return <p className="form-error">{error instanceof ApiError && error.status === 404 ? 'Commande introuvable.' : 'Impossible de charger la commande.'}</p>
  if (!order) return <p className="admin-loading">Chargement…</p>

  const move = async (status: OrderStatus) => {
    if (status === 'cancelled' && !window.confirm('Annuler cette commande ? Le stock sera remis.')) return

    setSaving(true)
    setMessage('')
    try {
      await changeOrderStatus(order.order_number, status)
      setVersion((current) => current + 1)
    } catch (caught) {
      // "caught", not "error": the page already has an error from useApi
      setMessage(caught instanceof ApiError ? caught.message : 'Une erreur est survenue.')
    }
    setSaving(false)
  }

  return (
    <>
      <PageTitle admin>{order.order_number}</PageTitle>
      <Link to="/admin/orders" className="back-link">
        <ArrowLeftIcon size={15} /> Retour aux commandes
      </Link>
      <div className="admin-heading">
        <h1 className="admin-title">{order.order_number}</h1>
        <span className={`admin-status admin-status--${order.status}`}>{STATUS_LABELS[order.status]}</span>
        <span className="admin-muted">{PAYMENT_LABELS[order.payment_status]}</span>
      </div>
      <p className="admin-muted admin-subtitle">Passée le {formatDateTime(order.created_at)}</p>

      {NEXT_STATUSES[order.status].length > 0 && (
        <div className="admin-actions">
          {NEXT_STATUSES[order.status].map((status) => (
            <button key={status} type="button" className={`button ${status === 'cancelled' ? 'button--ghost' : 'button--accent'}`} disabled={saving} onClick={() => move(status)}>
              Passer à « {STATUS_LABELS[status]} »
            </button>
          ))}
        </div>
      )}
      {message && (
        <p className="form-error" role="alert">
          {message}
        </p>
      )}

      <div className="admin-columns">
        <div>
          <section className="panel">
            <h2>Articles</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th className="is-number">Prix</th>
                    <th className="is-number">Qté</th>
                    <th className="is-number">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={`${item.product_id ?? 'deleted'}-${index}`}>
                      <td>
                        {item.product_name}
                        {item.product_id === null && <small>Produit supprimé depuis</small>}
                      </td>
                      <td className="is-number">{formatPrice(item.unit_price)}</td>
                      <td className="is-number">{item.quantity}</td>
                      <td className="is-number">{formatPrice(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="admin-totals">
              <div>
                <dt>Sous-total</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div>
                <dt>Livraison</dt>
                <dd>{Number(order.shipping_cost) === 0 ? 'Gratuite' : formatPrice(order.shipping_cost)}</dd>
              </div>
              <div className="admin-totals__total">
                <dt>Total</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="panel">
            <h2>Historique</h2>
            {(order.history ?? []).length === 0 && <p className="admin-muted">Aucun changement de statut pour le moment.</p>}
            <ol className="admin-timeline">
              {order.history?.map((entry) => (
                <li key={entry.id}>
                  <strong>
                    {STATUS_LABELS[entry.from_status]} → {STATUS_LABELS[entry.to_status]}
                  </strong>
                  <small>
                    {formatDateTime(entry.created_at)} · {entry.changed_by ?? 'Automatique'}
                  </small>
                  {entry.note && <p>{entry.note}</p>}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className="panel">
          <h2>Client</h2>
          <dl className="admin-details">
            <dt>Nom</dt>
            <dd>{order.customer_name}</dd>
            <dt>Téléphone</dt>
            <dd>
              <a href={`tel:${order.phone}`}>{order.phone}</a>
            </dd>
            {order.email && (
              <>
                <dt>E-mail</dt>
                <dd>
                  <a href={`mailto:${order.email}`}>{order.email}</a>
                </dd>
              </>
            )}
            <dt>Ville</dt>
            <dd>{order.city}</dd>
            <dt>Adresse</dt>
            <dd>{order.address}</dd>
            {order.note && (
              <>
                <dt>Remarque</dt>
                <dd>{order.note}</dd>
              </>
            )}
            <dt>WhatsApp</dt>
            <dd>{order.whatsapp_opened_at ? `Ouvert le ${formatDateTime(order.whatsapp_opened_at)}` : 'Pas encore ouvert par le client'}</dd>
          </dl>
          <div className="admin-actions">
            <a className="button button--accent button--small" href={`https://wa.me/${whatsappNumber(order.phone)}`} target="_blank" rel="noreferrer">
              Écrire sur WhatsApp
            </a>
            <a className="button button--ghost button--small" href={`tel:${order.phone}`}>
              Appeler
            </a>
          </div>
        </section>
      </div>
    </>
  )
}
