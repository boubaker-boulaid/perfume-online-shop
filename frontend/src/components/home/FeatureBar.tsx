import { CalendarIcon, HeadsetIcon, ShieldIcon, UserCircleIcon } from '../Icons'
import { Reveal } from '../Reveal'

const features = [
  { icon: <ShieldIcon />, title: 'Expérience authentique', text: 'Des parfums sélectionnés et créés avec passion' },
  { icon: <CalendarIcon />, title: 'Meilleur prix garanti', text: 'Une qualité exceptionnelle à prix imbattable' },
  { icon: <HeadsetIcon />, title: 'Assistance 24h/24', text: 'À votre écoute à tout moment, où que vous soyez' },
  { icon: <UserCircleIcon />, title: 'Sûr et fiable', text: 'Votre satisfaction est notre priorité' },
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
