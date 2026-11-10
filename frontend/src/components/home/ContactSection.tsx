import { useState, type ReactNode } from 'react'
import { ClockIcon, MailIcon, PinIcon, WhatsAppIcon } from '../Icons'
import { Reveal } from '../Reveal'
import { WHATSAPP_DISPLAY } from '../../utils/whatsapp'

const details: { icon: ReactNode; label: string; value: ReactNode }[] = [
  { icon: <WhatsAppIcon size={15} />, label: 'WhatsApp', value: WHATSAPP_DISPLAY },
  { icon: <MailIcon size={17} />, label: 'E-mail', value: 'contact@lumeparfums.ma' },
  { icon: <PinIcon size={17} />, label: 'Adresse', value: 'Agadir, Maroc' },
  { icon: <ClockIcon size={17} />, label: 'Horaires', value: 'Lun – sam, 10h – 20h' },
]

export function ContactSection() {
  const [sent, setSent] = useState(false)

  return (
    <section id="contact" className="container section section--wide">
      <Reveal className="contact-heading">
        <div className="eyebrow">Contact</div>
        <h2 className="display-title">
          Une question sur un <em>parfum</em>&nbsp;?
        </h2>
      </Reveal>

      <div className="contact">
        <Reveal className="panel">
          <p className="contact__intro">Le plus rapide, c’est WhatsApp. Pour une commande déjà passée, donnez-nous le numéro de téléphone utilisé.</p>
          <div className="contact__details">
            {details.map((detail) => (
              <div key={detail.label} className="contact__detail">
                <span className="tile-icon tile-icon--small">{detail.icon}</span>
                <div>
                  <div className="field__label">{detail.label}</div>
                  <div className="contact__value">{detail.value}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="contact__form-wrap" delay={200}>
          <form
            className="panel"
            onChange={() => setSent(false)}
            onSubmit={(event) => {
              event.preventDefault()
              setSent(true)
            }}
          >
            <div className="field-row">
              <label className="field">
                <span className="field__label">Nom</span>
                <input type="text" name="name" placeholder="Votre nom" autoComplete="name" />
              </label>
              <label className="field">
                <span className="field__label">Téléphone</span>
                <input type="tel" name="phone" placeholder="06 12 34 56 78" autoComplete="tel" inputMode="tel" />
              </label>
            </div>
            <label className="field">
              <span className="field__label">Sujet</span>
              <select name="subject" defaultValue="Conseil parfum">
                <option>Conseil parfum</option>
                <option>Ma commande</option>
                <option>Échange</option>
                <option>Vente en gros</option>
              </select>
            </label>
            <label className="field">
              <span className="field__label">Message</span>
              <textarea name="message" rows={5} placeholder="Dites-nous ce que vous cherchez : un parfum pour vous, un cadeau, une odeur que vous aimez…" />
            </label>
            <div className="contact__send">
              <button type="submit" className="button button--accent">
                {sent ? 'Envoyé ✓' : 'Envoyer'}
              </button>
              <span role="status">{sent ? 'Merci\u00a0! On vous répond très vite.' : 'On vous répond dans la journée.'}</span>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
