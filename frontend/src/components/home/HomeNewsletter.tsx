import type { FormEvent } from 'react'
import { WHATSAPP_URL } from '../../utils/whatsapp'
import { Reveal } from '../Reveal'
import { LeafSprig } from './Botanicals'

// The shop has no e-mail list yet: people join on WhatsApp. So the form opens WhatsApp with a
// message that's already written and carries the address, and the shop really receives it.
export function HomeNewsletter() {
  const subscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const email = new FormData(event.currentTarget).get('email')
    const message = `Bonjour, je souhaite recevoir vos nouveautés et vos offres. Mon e-mail : ${email}`

    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="subscribe">
      <LeafSprig className="home-art subscribe__leaves subscribe__leaves--left" />
      <LeafSprig className="home-art subscribe__leaves subscribe__leaves--right" />

      <Reveal className="subscribe__content">
        <p className="tag">Restons en contact</p>
        <h2 className="home-title subscribe__title">Un peu plus de luxe dans votre boîte mail.</h2>
        <p className="subscribe__text">Soyez les premiers informés des nouveaux parfums, des offres exclusives et plus encore.</p>

        <form className="subscribe__form" onSubmit={subscribe}>
          <label className="sr-only" htmlFor="subscribe-email">
            Votre adresse e-mail
          </label>
          <input id="subscribe-email" type="email" name="email" placeholder="Votre adresse e-mail" autoComplete="email" required />
          <button type="submit" className="button button--accent">
            S’abonner
          </button>
        </form>
        <p className="subscribe__note">L’inscription se confirme sur WhatsApp.</p>
      </Reveal>
    </section>
  )
}
