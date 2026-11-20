import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Field } from '../../components/Field'
import { ArrowLeftIcon } from '../../components/Icons'
import { useApi } from '../../hooks/useApi'
import { ApiError } from '../../services/apiError'
import { deleteCategory, getAdminCategory, saveCategory } from '../adminApi'
import { checkImage } from '../images'
import { PageTitle } from '../../components/PageTitle'

// One form for /admin/categories/new and /admin/categories/:slug, like the product form
export function CategoryFormPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { data: category, error: loadError, loading } = useApi(() => (slug ? getAdminCategory(slug) : Promise.resolve(null)), slug ?? 'new')
  const [preview, setPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  if (loadError) return <p className="form-error">{loadError instanceof ApiError && loadError.status === 404 ? 'Catégorie introuvable.' : 'Impossible de charger la catégorie.'}</p>
  if (loading) return <p className="admin-loading">Chargement…</p>

  const fail = (error: unknown) => {
    if (error instanceof ApiError && error.errors) setErrors(error.errors)
    else setMessage(error instanceof ApiError ? error.message : 'Une erreur est survenue.')
    setSaving(false)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    // only one checkbox this time: an unchecked box is missing from FormData
    form.set('is_active', form.has('is_active') ? '1' : '0')

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
      await saveCategory(form, slug)
      navigate('/admin/categories')
    } catch (error) {
      fail(error)
    }
  }

  const remove = async () => {
    if (!slug || !window.confirm('Supprimer cette catégorie ?')) return

    setSaving(true)
    setErrors({})
    setMessage('')
    try {
      await deleteCategory(slug)
      navigate('/admin/categories')
    } catch (error) {
      fail(error) // a 409 says the category still has products
    }
  }

  const choose = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  const image = preview ?? category?.image_path

  return (
    <>
      <PageTitle admin>{category ? category.name : 'Nouvelle catégorie'}</PageTitle>
      <Link to="/admin/categories" className="back-link">
        <ArrowLeftIcon size={15} /> Retour aux catégories
      </Link>
      <h1 className="admin-title">{category ? category.name : 'Nouvelle catégorie'}</h1>

      <form key={category?.id ?? 'new'} className="panel admin-form" onSubmit={submit} noValidate>
        <Field label="Nom" name="name" error={errors.name}>
          <input id="name" name="name" defaultValue={category?.name} maxLength={255} required />
        </Field>
        <Field label="Description" name="description" error={errors.description}>
          <textarea id="description" name="description" rows={3} defaultValue={category?.description ?? ''} />
        </Field>
        <Field label="Image (facultative : jpg, png ou webp, 4 Mo maximum)" name="image" error={errors.image}>
          <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} />
        </Field>
        {image && <img className="admin-preview" src={image} alt="" />}
        <Field label="Ordre (les plus petits en premier)" name="sort_order" error={errors.sort_order}>
          <input id="sort_order" name="sort_order" type="number" min="0" step="1" inputMode="numeric" defaultValue={category?.sort_order ?? 0} required />
        </Field>

        <label className="admin-check">
          <input type="checkbox" name="is_active" defaultChecked={category?.is_active ?? true} /> Visible dans la boutique (avec ses produits)
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
