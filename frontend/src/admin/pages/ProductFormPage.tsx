import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Field } from '../../components/Field'
import { ArrowLeftIcon } from '../../components/Icons'
import { useApi } from '../../hooks/useApi'
import { ApiError } from '../../services/apiError'
import { deleteProduct, getAdminProduct, getAllAdminCategories, saveProduct } from '../adminApi'
import { checkImage } from '../images'
import { PageTitle } from '../../components/PageTitle'

// unchecked boxes are missing from FormData: these are always sent as 1 or 0
const BOOLEAN_FIELDS = ['is_active', 'is_featured', 'is_offer'] as const

// One form for /admin/products/new and /admin/products/:slug: the only difference is the slug.
export function ProductFormPage() {
  const { slug } = useParams() // undefined on /admin/products/new
  const navigate = useNavigate()
  const { data: product, error: loadError, loading } = useApi(() => (slug ? getAdminProduct(slug) : Promise.resolve(null)), slug ?? 'new')
  const { data: categories } = useApi(getAllAdminCategories, 'all-categories')
  const [preview, setPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  if (loadError) return <p className="form-error">{loadError instanceof ApiError && loadError.status === 404 ? 'Produit introuvable.' : 'Impossible de charger le produit.'}</p>
  // the categories too: a select only picks its default value among the options it already has
  if (loading || !categories) return <p className="admin-loading">Chargement…</p>

  const fail = (error: unknown) => {
    if (error instanceof ApiError && error.errors) setErrors(error.errors)
    else setMessage(error instanceof ApiError ? error.message : 'Une erreur est survenue.')
    setSaving(false)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    for (const name of BOOLEAN_FIELDS) form.set(name, form.has(name) ? '1' : '0')

    // leaves out an empty file input, and stops an image too big for the backend
    const imageError = checkImage(form)
    if (imageError) {
      setErrors({ image: [imageError] })
      setMessage('')
      return
    }

    setSaving(true)
    setErrors({})
    setMessage('')

    try {
      await saveProduct(form, slug)
      navigate('/admin/products')
    } catch (error) {
      fail(error)
    }
  }

  const remove = async () => {
    if (!slug || !window.confirm('Supprimer ce produit ? Les anciennes commandes gardent leur copie.')) return

    setSaving(true)
    setErrors({})
    setMessage('')
    try {
      await deleteProduct(slug)
      navigate('/admin/products')
    } catch (error) {
      fail(error) // a 409 says the product is used in an offer
    }
  }

  const choose = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  return (
    <>
      <PageTitle admin>{product ? product.name : 'Nouveau produit'}</PageTitle>
      <Link to="/admin/products" className="back-link">
        <ArrowLeftIcon size={15} /> Retour aux produits
      </Link>
      <h1 className="admin-title">{product ? product.name : 'Nouveau produit'}</h1>

      {/* key: another product starts from its own values, not the last one's */}
      <form key={product?.id ?? 'new'} className="panel admin-form" onSubmit={submit} noValidate>
        <Field label="Nom" name="name" error={errors.name}>
          <input id="name" name="name" defaultValue={product?.name} maxLength={255} required />
        </Field>
        <Field label="Catégorie" name="category_id" error={errors.category_id}>
          <select id="category_id" name="category_id" defaultValue={product?.category_id ?? ''} required>
            <option value="" disabled>
              Choisir…
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
                {!category.is_active && ' (masquée)'}
              </option>
            ))}
          </select>
        </Field>
        <div className="field-row admin-field-row--3">
          <Field label="Prix (DH)" name="price" error={errors.price}>
            <input id="price" name="price" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={product?.price} required />
          </Field>
          <Field label="Ancien prix (DH)" name="compare_at_price" error={errors.compare_at_price}>
            <input id="compare_at_price" name="compare_at_price" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={product?.compare_at_price ?? ''} />
          </Field>
          <Field label="Stock" name="stock" error={errors.stock}>
            <input id="stock" name="stock" type="number" min="0" step="1" inputMode="numeric" defaultValue={product?.stock ?? 0} required />
          </Field>
        </div>
        <Field label="Description" name="description" error={errors.description}>
          <textarea id="description" name="description" rows={3} defaultValue={product?.description ?? ''} />
        </Field>
        <Field label="Notes" name="notes" error={errors.notes}>
          <input id="notes" name="notes" defaultValue={product?.notes ?? ''} placeholder="Safran, Rose, Ambre" />
        </Field>
        <Field label="Image (jpg, png ou webp, 4 Mo maximum)" name="image" error={errors.image}>
          <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} />
        </Field>
        {(preview ?? product?.image_path) && <img className="admin-preview" src={preview ?? product?.image_path} alt="" />}

        <label className="admin-check">
          <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} /> Visible dans la boutique
        </label>
        <label className="admin-check">
          <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured ?? false} /> Meilleure vente (page d’accueil)
        </label>
        <label className="admin-check">
          <input type="checkbox" name="is_offer" defaultChecked={product?.is_offer ?? false} /> Coffret d’une offre (jamais listé dans la boutique)
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
