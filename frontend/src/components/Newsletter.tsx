import { useState } from 'react'
import { SendIcon } from './Icons'
import { Reveal } from './Reveal'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  return (
    <section className="container section newsletter-section">
      <Reveal className="newsletter">
        <span className="newsletter__icon">
          <SendIcon size={21} />
        </span>
        <div>
          <div className="newsletter__kicker">Restez informé</div>
          <div className="newsletter__title">
            Abonnez-vous et profitez de <span>10&nbsp;%</span> de réduction
          </div>
          <div className="newsletter__text">Soyez les premiers informés des nouveautés, des offres exclusives et plus encore.</div>
        </div>
        <form
          className="newsletter__form"
          onSubmit={(event) => {
            event.preventDefault()
            setSubscribed(Boolean(email.trim()))
          }}
        >
          <input
            type="email"
            aria-label="Adresse e-mail"
            placeholder="Votre e-mail"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setSubscribed(false)
            }}
          />
          <button type="submit" className="button button--accent">
            {subscribed ? 'Abonné' : 'S’abonner'}
          </button>
        </form>
      </Reveal>
    </section>
  )
}
