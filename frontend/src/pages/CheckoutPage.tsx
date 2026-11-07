import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { PageHeading } from '../components/PageHeading'
import { PillLink } from '../components/PillLink'
import { useCart } from '../context/cartContext'
import { ApiError, placeOrder } from '../services/api'
import { formatPrice } from '../utils/format'
import { createUuid } from '../utils/uuid'

type Errors = Record<string, string[]>

function Field({ label, name, error, children }: { label: string; name: string; error?: string[]; children: React.ReactNode }) {
  return (
    <label className={`field${error ? ' has-error' : ''}`} htmlFor={name}>
      <span className="field__label">{label}</span>
      {children}
      {error && <span className="field__error">{error[0]}</span>}
    </label>
  )
}

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
        <PageHeading eyebrow="Commande" title={<>Votre panier est <em>vide</em></>}>
          Ajoutez un parfum à votre panier avant de commander.
        </PageHeading>
        <PillLink to="/shop">Découvrir la boutique</PillLink>
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
        setMessage('Une erreur est survenue. Veuillez réessayer.')
      }
      setSubmitting(false)
    }
  }

  return (
    <div className="container page">
      <PageHeading eyebrow="Commande" title={<>Vos <em>coordonnées</em></>}>
        Payez en espèces à la réception. Après cette étape, vous nous enverrez votre commande sur WhatsApp.
      </PageHeading>

      <div className="checkout-layout">
        <form className="panel" onSubmit={submit} noValidate>
          <Field label="Nom complet" name="customer_name" error={errors.customer_name}>
            <input id="customer_name" name="customer_name" type="text" autoComplete="name" maxLength={50} required />
          </Field>
          <div className="field-row">
            <Field label="Téléphone" name="phone" error={errors.phone}>
              <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="06 12 34 56 78" required />
            </Field>
            <Field label="E-mail" name="email" error={errors.email}>
              <input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="vous@email.com" required />
            </Field>
          </div>
          <Field label="Ville" name="city" error={errors.city}>
            <input id="city" name="city" type="text" autoComplete="address-level2" maxLength={50} required />
          </Field>
          <Field label="Adresse" name="address" error={errors.address}>
            <input id="address" name="address" type="text" autoComplete="street-address" maxLength={255} required />
          </Field>
          <Field label="Note (facultatif)" name="note">
            <textarea id="note" name="note" rows={3} maxLength={255} placeholder="Une précision pour la livraison&nbsp;?" />
          </Field>

          {message && (
            <p className="form-error" role="alert">
              {message}
            </p>
          )}

          <button type="submit" className="button button--accent button--block" disabled={submitting}>
            {submitting ? 'Commande en cours…' : `Commander · ${formatPrice(subtotal)}`}
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
            <span>Offerte</span>
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
