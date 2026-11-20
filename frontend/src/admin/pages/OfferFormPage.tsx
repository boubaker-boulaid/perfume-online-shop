import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Field } from '../../components/Field'
import { ArrowLeftIcon } from '../../components/Icons'
import { useApi } from '../../hooks/useApi'
import { ApiError } from '../../services/apiError'
import { formatPrice, toInputDate } from '../../utils/format'
import { deleteOffer, getAdminOffer, getAllAdminProducts, saveOffer } from '../adminApi'

type Errors = Record<string, string[]>

// The errors for a list come as "product_ids" or "product_ids.0": the first one of either
const listError = (errors: Errors, name: string) => Object.entries(errors).find(([key]) => key === name || key.startsWith(`${name}.`))?.[1]

// One form for /admin/offers/new and /admin/offers/:slug. An offer sells a set (a product marked
// "Coffret d'une offre") at the set's price, and lists the perfumes inside it.
export function OfferFormPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { data: offer, error: loadError, loading } = useApi(() => (slug ? getAdminOffer(slug) : Promise.resolve(null)), slug ?? 'new')
  const { data: products } = useApi(getAllAdminProducts, 'all-products')
  const [preview, setPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  if (loadError) return <p className="form-error">{loadError instanceof ApiError && loadError.status === 404 ? 'Offre introuvable.' : 'Impossible de charger l’offre.'}</p>
  // the products too: the selects and checkboxes are built from them
  if (loading || !products) return <p className="admin-loading">Chargement…</p>

  const sets = products.filter((product) => product.is_offer)
  const perfumes = products.filter((product) => !product.is_offer)
  const inside = new Set(offer?.products.map((product) => product.id))

  const fail = (error: unknown) => {
    if (error instanceof ApiError && error.errors) setErrors(error.errors)
    else setMessage(error instanceof ApiError ? error.message : 'Une erreur est survenue.')
    setSaving(false)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    form.set('is_active', form.has('is_active') ? '1' : '0')

    // one condition per line in the textarea, sent as terms[]
    const terms = String(form.get('terms') ?? '')
      .split('\n')
      .map((term) => term.trim())
      .filter(Boolean)
    form.delete('terms')
    terms.forEach((term) => form.append('terms[]', term))

    const image = form.get('image')
    if (image instanceof File && image.size === 0) form.delete('image')

    setSaving(true)
    setErrors({})
    setMessage('')

    try {
      await saveOffer(form, slug)
      navigate('/admin/offers')
    } catch (error) {
      fail(error)
    }
  }

  const remove = async () => {
    if (!slug || !window.confirm('Supprimer cette offre ? Son coffret et ses parfums restent : masquez ou supprimez le coffret ensuite.')) return

    setSaving(true)
    setErrors({})
    setMessage('')
    try {
      await deleteOffer(slug)
      navigate('/admin/offers')
    } catch (error) {
      fail(error)
    }
  }

  const choose = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  const image = preview ?? offer?.image_path
  const perfumesError = listError(errors, 'product_ids')
  const termsError = listError(errors, 'terms')

  return (
    <>
      <Link to="/admin/offers" className="back-link">
        <ArrowLeftIcon size={15} /> Retour aux offres
      </Link>
      <h1 className="admin-title">{offer ? offer.title : 'Nouvelle offre'}</h1>

      <form key={offer?.id ?? 'new'} className="panel admin-form" onSubmit={submit} noValidate>
        {!offer && (
          <p className="admin-hint">
            Une offre se crée en deux étapes. 1. <Link to="/admin/products/new">Créez son coffret</Link> comme un produit : son nom, son prix (celui de l’offre), son stock, la case « Coffret d’une offre » cochée, et les parfums dans
            sa description. 2. Ici, choisissez ce coffret et cochez les parfums qu’il contient.
          </p>
        )}

        {/* A disabled field is never sent: the set of an existing offer can't change */}
        <Field label="Coffret (le produit vendu, au prix de l’offre)" name="product_id" error={errors.product_id}>
          <select id="product_id" name="product_id" defaultValue={offer?.set.id ?? ''} disabled={Boolean(offer)} required>
            <option value="" disabled>
              Choisir…
            </option>
            {sets.map((set) => (
              <option key={set.id} value={set.id}>
                {set.name} · {formatPrice(set.price)}
              </option>
            ))}
          </select>
        </Field>
        {!offer && sets.length === 0 && <p className="admin-muted admin-form__note">Aucun coffret pour le moment : créez-le d’abord comme un produit.</p>}

        <Field label="Titre" name="title" error={errors.title}>
          <input id="title" name="title" defaultValue={offer?.title} maxLength={255} required />
        </Field>
        <Field label="Accroche (facultative)" name="tagline" error={errors.tagline}>
          <input id="tagline" name="tagline" defaultValue={offer?.tagline ?? ''} maxLength={255} />
        </Field>
        <Field label="Description (facultative)" name="description" error={errors.description}>
          <textarea id="description" name="description" rows={3} defaultValue={offer?.description ?? ''} />
        </Field>
        <Field label={`Image (jpg, png ou webp, 2 Mo maximum${offer ? ', facultative' : ''})`} name="image" error={errors.image}>
          <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} />
        </Field>
        {image && <img className="admin-preview admin-preview--wide" src={image} alt="" />}

        <fieldset className={`admin-fieldset${perfumesError ? ' has-error' : ''}`}>
          <legend className="field__label">Parfums inclus</legend>
          <div className="admin-checks">
            {perfumes.map((perfume) => (
              <label key={perfume.id} className="admin-check">
                <input type="checkbox" name="product_ids[]" value={perfume.id} defaultChecked={inside.has(perfume.id)} />
                <span>
                  {perfume.name} · {formatPrice(perfume.price)}
                  {!perfume.is_active && ' (masqué)'}
                </span>
              </label>
            ))}
          </div>
          {perfumesError && <span className="field__error">{perfumesError[0]}</span>}
        </fieldset>

        <Field label="Parfum offert (facultatif, pas parmi les parfums inclus)" name="free_product_id" error={errors.free_product_id}>
          <select id="free_product_id" name="free_product_id" defaultValue={offer?.free_product?.id ?? ''}>
            <option value="">Aucun parfum offert</option>
            {perfumes.map((perfume) => (
              <option key={perfume.id} value={perfume.id}>
                {perfume.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="field-row">
          <Field label="Début" name="starts_at" error={errors.starts_at}>
            <input id="starts_at" name="starts_at" type="datetime-local" defaultValue={offer ? toInputDate(offer.starts_at) : ''} required />
          </Field>
          <Field label="Fin" name="ends_at" error={errors.ends_at}>
            <input id="ends_at" name="ends_at" type="datetime-local" defaultValue={offer ? toInputDate(offer.ends_at) : ''} required />
          </Field>
        </div>

        <Field label="Conditions (une par ligne, 10 au maximum)" name="terms" error={termsError}>
          <textarea id="terms" name="terms" rows={4} defaultValue={offer?.terms.join('\n') ?? ''} />
        </Field>
        <Field label="Ordre (les plus petits en premier)" name="sort_order" error={errors.sort_order}>
          <input id="sort_order" name="sort_order" type="number" min="0" step="1" inputMode="numeric" defaultValue={offer?.sort_order ?? 0} />
        </Field>

        <label className="admin-check">
          <input type="checkbox" name="is_active" defaultChecked={offer?.is_active ?? true} /> Active (visible entre le début et la fin)
        </label>

        {message && (
          <p className="form-error" role="alert">
            {message}
          </p>
        )}
        <div className="admin-actions admin-form__actions">
          <button type="submit" className="button button--accent" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          {slug && (
            <button type="button" className="button button--ghost" disabled={saving} onClick={remove}>
              Supprimer
            </button>
          )}
        </div>
      </form>
    </>
  )
}
