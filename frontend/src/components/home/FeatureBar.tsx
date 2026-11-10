import { BadgeCheckIcon, BanknoteIcon, TruckIcon, WhatsAppIcon } from '../Icons'
import { Reveal } from '../Reveal'

const features = [
  { icon: <BadgeCheckIcon />, title: '100% originaux', text: 'Chaque flacon est vérifié avant l’envoi.' },
  { icon: <TruckIcon />, title: 'Livraison gratuite', text: 'Partout au Maroc, en 24 à 72h.' },
  { icon: <BanknoteIcon />, title: 'Paiement à la réception', text: 'Vous payez seulement quand vous avez le colis.' },
  { icon: <WhatsAppIcon />, title: 'Réponse rapide sur WhatsApp', text: 'Une question\u00a0? On vous répond dans la journée.' },
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
