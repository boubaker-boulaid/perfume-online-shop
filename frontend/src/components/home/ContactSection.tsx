import { useState, type ReactNode } from 'react'
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from '../Icons'
import { Reveal } from '../Reveal'

const details: { icon: ReactNode; label: string; value: ReactNode }[] = [
  { icon: <MailIcon size={17} />, label: 'E-mail', value: 'hello@lumeparfums.com' },
  { icon: <PhoneIcon size={17} />, label: 'Téléphone', value: '+351 21 555 0148' },
  {
    icon: <PinIcon size={17} />,
    label: 'Atelier',
    value: (
      <>
        Rua das Flores 27
        <br />
        1200-193 Lisbonne, Portugal
      </>
    ),
  },
  {
    icon: <ClockIcon size={17} />,
    label: 'Horaires',
    value: (
      <>
        Lun – ven, 10h00 – 18h00 (WET)
        <br />
        Samedi sur rendez-vous
      </>
    ),
  },
]

export function ContactSection() {
  const [sent, setSent] = useState(false)

  return (
    <section id="contact" className="container section section--wide">
      <Reveal className="contact-heading">
        <div className="eyebrow">Contactez-nous</div>
        <h2 className="display-title">
          Dites-nous ce que vous <em>recherchez</em>
        </h2>
      </Reveal>

      <div className="contact">
        <Reveal className="panel">
          <p className="contact__intro">Notre équipe répond à chaque message sous un jour ouvré. Pour une commande déjà passée, indiquez votre numéro de commande.</p>
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
                <span className="field__label">E-mail</span>
                <input type="email" name="email" placeholder="vous@email.com" autoComplete="email" />
              </label>
            </div>
            <label className="field">
              <span className="field__label">Sujet</span>
              <select name="subject" defaultValue="Conseil parfum">
                <option>Conseil parfum</option>
                <option>Commande ou livraison</option>
                <option>Retours et échanges</option>
                <option>Grossistes et presse</option>
              </select>
            </label>
            <label className="field">
              <span className="field__label">Message</span>
              <textarea name="message" rows={5} placeholder="Parlez-nous du parfum que vous recherchez : les notes que vous aimez, les occasions, ce que vous avez déjà porté." />
            </label>
            <div className="contact__send">
              <button type="submit" className="button button--accent">
                {sent ? 'Message envoyé' : 'Envoyer le message'}
              </button>
              <span role="status">{sent ? 'Merci, nous vous répondrons sous un jour ouvré.' : 'Nous répondons sous un jour ouvré.'}</span>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
