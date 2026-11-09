import { Link } from 'react-router'
import banner from '../../assets/images/banner.webp'
import { ArrowRightIcon } from '../Icons'
import { Reveal } from '../Reveal'

export function DiscoverBanner() {
  return (
    <section id="discover" className="container section section--tight">
      <Reveal className="banner">
        <div className="banner__content">
          <div className="eyebrow">Nouveautés</div>
          <h2>
            Les derniers <em>arrivages</em>
          </h2>
          <p>Nouveaux parfums en stock cette semaine. Quantités limitées.</p>
          <Link to="/#collections" className="ghost-link">
            Voir les nouveautés <ArrowRightIcon size={15} strokeWidth={1.6} />
          </Link>
        </div>
        <div className="banner__image">
          <img src={banner} alt="Un flacon de parfum Lumé" width={1536} height={456} loading="lazy" />
        </div>
      </Reveal>
    </section>
  )
}
