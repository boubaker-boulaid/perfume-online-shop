import { WHATSAPP_URL } from '../utils/whatsapp'
import { SendIcon } from './Icons'
import { Reveal } from './Reveal'

export function Newsletter() {
  return (
    <section className="container section newsletter-section">
      <Reveal className="newsletter">
        <span className="newsletter__icon">
          <SendIcon size={21} />
        </span>
        <div>
          <div className="newsletter__kicker">Les promos en premier</div>
          <div className="newsletter__title">Rejoignez-nous sur WhatsApp</div>
          <div className="newsletter__text">Nouveaux arrivages et promos, directement sur votre téléphone.</div>
        </div>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="button button--accent newsletter__action">
          Rejoindre sur WhatsApp
        </a>
      </Reveal>
    </section>
  )
}
