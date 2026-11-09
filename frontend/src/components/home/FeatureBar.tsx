import { CalendarIcon, HeadsetIcon, ShieldIcon, UserCircleIcon } from '../Icons'
import { Reveal } from '../Reveal'

const features = [
  { icon: <ShieldIcon />, title: '100% originaux', text: 'Chaque flacon est vérifié avant l’envoi.' },
  { icon: <CalendarIcon />, title: 'Livraison gratuite', text: 'Partout au Maroc, en 24 à 72h.' },
  { icon: <HeadsetIcon />, title: 'Paiement à la réception', text: 'Vous payez seulement quand vous avez le colis.' },
  { icon: <UserCircleIcon />, title: 'Réponse rapide sur WhatsApp', text: 'Une question\u00a0? On vous répond dans la journée.' },
]

export function FeatureBar() {
  return (
    <div className="container">
      <Reveal className="features">
        {features.map((feature) => (
          <div key={feature.title} className="feature">
            <span className="tile-icon">{feature.icon}</span>
            <div>
              <div className="feature__title">{feature.title}</div>
              <p>{feature.text}</p>
            </div>
          </div>
        ))}
      </Reveal>
    </div>
  )
}
