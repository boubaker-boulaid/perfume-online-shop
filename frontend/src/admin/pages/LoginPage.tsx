import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { ApiError } from '../../services/apiError'
import { login } from '../adminApi'

type Errors = Record<string, string[]>

export function LoginPage() {
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Errors>({})
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    setSending(true)
    setErrors({})
    setMessage('')

    try {
      await login(String(data.get('email') ?? ''), String(data.get('password') ?? ''), data.get('remember') === 'on')
      navigate('/admin', { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        navigate('/admin', { replace: true }) // already logged in
        return
      }
      if (error instanceof ApiError && error.errors) setErrors(error.errors)
      else setMessage(error instanceof ApiError ? error.message : 'Une erreur est survenue.')
      setSending(false)
    }
  }

  return (
    <div className="admin-login">
      <form className="panel" onSubmit={submit} noValidate>
        <h1>Administration</h1>
        <label className={`field${errors.email ? ' has-error' : ''}`}>
          <span className="field__label">E-mail</span>
          <input name="email" type="email" autoComplete="username" required />
          {errors.email && <span className="field__error">{errors.email[0]}</span>}
        </label>
        <label className={`field${errors.password ? ' has-error' : ''}`}>
          <span className="field__label">Mot de passe</span>
          <input name="password" type="password" autoComplete="current-password" required />
          {errors.password && <span className="field__error">{errors.password[0]}</span>}
        </label>
        <label className="admin-check">
          <input name="remember" type="checkbox" /> Rester connecté
        </label>
        {message && (
          <p className="form-error" role="alert">
            {message}
          </p>
        )}
        <button type="submit" className="button button--accent button--block" disabled={sending}>
          {sending ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}
