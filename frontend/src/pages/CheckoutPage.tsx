import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Field } from '../components/Field'
import { PageHeading } from '../components/PageHeading'
import { BanknoteIcon } from '../components/Icons'
import { PillLink } from '../components/PillLink'
import { useCart } from '../context/cartContext'
import { ApiError, placeOrder } from '../services/api'
import { formatPrice } from '../utils/format'
import { createUuid } from '../utils/uuid'
import { PageTitle } from '../components/PageTitle'

type Errors = Record<string, string[]>

export function CheckoutPage() {
  const { items, subtotal, clear } = useCart()
  const navigate = useNavigate()
  // One key for this checkout, reused on every retry, so a retry can't create a second order.
  const [idempotencyKey] = useState(createUuid)
  const [errors, setErrors] = useState<Errors>({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (items.length === 0) {
    return (
      <div className="container page">
        <PageTitle>Commande</PageTitle>
        <PageHeading eyebrow="Commande" title={<>Votre panier est <em>vide</em></>} trail={[{ label: 'Panier', to: '/cart' }, { label: 'Commande' }]} center>
          Ajoutez un parfum avant de commander.
        </PageHeading>
        <div className="page-actions">
          <PillLink to="/shop">Voir les parfums</PillLink>
        </div>
      </div>
    )
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const text = (name: string) => String(data.get(name) ?? '').trim()

    setSubmitting(true)
    setErrors({})
    setMessage('')

    try {
      const order = await placeOrder({
        customer_name: text('customer_name'),
        phone: text('phone'),
        email: text('email'),
        city: text('city'),
        address: text('address'),
        note: text('note') || undefined,
        idempotency_key: idempotencyKey,
        items: items.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
      })

      navigate('/order-confirmation', { replace: true, state: { order } })
      clear()
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors ?? {})
        if (!error.errors) setMessage(error.message)
      } else {
        setMessage('Un problème est survenu. Réessayez s’il vous plaît.')
      }
      setSubmitting(false)
    }
  }

  return (
    <div className="container page">
      <PageTitle>Commande</PageTitle>
      <PageHeading eyebrow="Commande" title={<>Vos <em>informations</em></>} trail={[{ label: 'Panier', to: '/cart' }, { label: 'Commande' }]}>
        Vous payez en espèces au livreur. À l’étape suivante, vous nous envoyez la commande sur WhatsApp.
      </PageHeading>

      <div className="checkout-layout">
        <form className="panel checkout-form" onSubmit={submit} noValidate>
          <h2 className="checkout-form__title">Livraison</h2>
          <Field label="Nom et prénom" name="customer_name" error={errors.customer_name}>
            <input id="customer_name" name="customer_name" type="text" autoComplete="name" maxLength={50} required />
          </Field>
          <div className="field-row">
            <Field label="Téléphone" name="phone" error={errors.phone}>
              <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="06 12 34 56 78" required />
            </Field>
            <Field label="E-mail (facultatif)" name="email" error={errors.email}>
              <input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="vous@email.com" />
            </Field>
          </div>
          <Field label="Ville" name="city" error={errors.city}>
            <input id="city" name="city" type="text" autoComplete="address-level2" maxLength={50} required />
          </Field>
          <Field label="Adresse (quartier, rue, n°)" name="address" error={errors.address}>
            <input id="address" name="address" type="text" autoComplete="street-address" maxLength={255} required />
          </Field>
          <Field label="Remarque (facultatif)" name="note">
            <textarea id="note" name="note" rows={3} maxLength={255} placeholder="Ex. : appelez-moi avant de venir" />
          </Field>

          <div className="checkout-form__payment">
            <span className="tile-icon tile-icon--small">
              <BanknoteIcon size={17} />
            </span>
            <div>
              <strong>Paiement à la réception</strong>
              <p>En espèces, au livreur. La livraison est gratuite partout au Maroc.</p>
            </div>
          </div>

          {message && (
            <p className="form-error" role="alert">
              {message}
            </p>
          )}

          <button type="submit" className="button button--accent button--block" disabled={submitting}>
            {submitting ? 'Envoi en cours…' : `Commander · ${formatPrice(subtotal)}`}
          </button>
        </form>

        <aside className="panel summary">
          <h2>Votre commande</h2>
          <ul className="summary__items">
            {items.map((item) => (
              <li key={item.product_id}>
                <img src={item.image_path} alt="" width={600} height={600} />
                <span>
                  {item.name}
                  {item.offer_contents && <small>{item.offer_contents}</small>}
                  <small>Quantité {item.quantity}</small>
                </span>
                <span>{formatPrice(Number(item.price) * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="summary__row">
            <span>Livraison</span>
            <span>Gratuite</span>
          </div>
          <div className="summary__row summary__row--total">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Link to="/cart" className="text-button summary__continue">
            Modifier le panier
          </Link>
        </aside>
      </div>
    </div>
  )
}
