import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Field } from '../../components/Field'
import { ApiError } from '../../services/apiError'
import { sendResetLink } from '../adminApi'

const SENT = 'Si ce compte existe, un e-mail a été envoyé.'

export function ForgotPasswordPage() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim()

    setSending(true)
    setMessage('')
    try {
      await sendResetLink(email)
      setMessage(SENT)
    } catch (error) {
      // The same sentence whatever the answer, so nobody can find out which e-mails have an
      // account. Only a missing connection (no answer at all) is told apart.
      setMessage(error instanceof ApiError && error.status === 0 ? error.message : SENT)
    }
    setSending(false)
  }

  return (
    <div className="admin-login">
      <form className="panel" onSubmit={submit} noValidate>
        <h1>Mot de passe oublié</h1>
        <p className="admin-muted admin-login__text">Saisissez l’e-mail du compte : vous recevrez un lien pour choisir un nouveau mot de passe.</p>
        <Field label="E-mail" name="email">
          <input id="email" name="email" type="email" autoComplete="username" required />
        </Field>
        {message && (
          <p className="admin-notice" role="status">
            {message}
          </p>
        )}
        <button type="submit" className="button button--accent button--block" disabled={sending}>
          {sending ? 'Envoi…' : 'Envoyer le lien'}
        </button>
        <Link to="/admin/login" className="text-button admin-login__link">
          Retour à la connexion
        </Link>
      </form>
    </div>
  )
}
