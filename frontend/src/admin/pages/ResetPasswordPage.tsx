import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import '../../styles/admin.css'
import { Field } from '../../components/Field'
import { ApiError } from '../../services/apiError'
import { resetPassword } from '../adminApi'
import { PageTitle } from '../../components/PageTitle'

// The page the reset e-mail links to: {FRONTEND_URL}/password-reset/{token}?email=…
// App.tsx loads it with lazy(), which needs a default export.
export default function ResetPasswordPage() {
  const { token = '' } = useParams()
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    setSending(true)
    setErrors({})
    setMessage('')
    try {
      await resetPassword({
        token,
        email,
        password: String(data.get('password') ?? ''),
        password_confirmation: String(data.get('password_confirmation') ?? ''),
      })
      navigate('/admin/login', { replace: true, state: { notice: 'Mot de passe changé. Vous pouvez vous connecter.' } })
    } catch (error) {
      if (error instanceof ApiError && error.errors) setErrors(error.errors)
      else setMessage(error instanceof ApiError ? error.message : 'Une erreur est survenue.')
      setSending(false)
    }
  }

  return (
    <div className="admin-login">
      <PageTitle admin>Nouveau mot de passe</PageTitle>
      <form className="panel" onSubmit={submit} noValidate>
        <h1>Nouveau mot de passe</h1>
        <p className="admin-muted admin-login__text">Pour le compte {email || 'inconnu'}.</p>
        {/* a bad or expired link comes back as an error on "email" */}
        {errors.email && (
          <p className="form-error" role="alert">
            {errors.email[0]} <Link to="/admin/forgot-password">Demander un nouveau lien</Link>
          </p>
        )}
        <Field label="Nouveau mot de passe" name="password" error={errors.password}>
          <input id="password" name="password" type="password" autoComplete="new-password" required />
        </Field>
        <Field label="Confirmer le mot de passe" name="password_confirmation">
          <input id="password_confirmation" name="password_confirmation" type="password" autoComplete="new-password" required />
        </Field>
        {message && (
          <p className="form-error" role="alert">
            {message}
          </p>
        )}
        <button type="submit" className="button button--accent button--block" disabled={sending}>
          {sending ? 'Enregistrement…' : 'Changer le mot de passe'}
        </button>
      </form>
    </div>
  )
}
