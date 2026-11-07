import { Link } from 'react-router'
import banner from '../../assets/images/banner.webp'
import { ArrowRightIcon } from '../Icons'
import { Reveal } from '../Reveal'

export function DiscoverBanner() {
  return (
    <section id="discover" className="container section section--tight">
      <Reveal className="banner">
        <div className="banner__content">
          <div className="eyebrow">Nouvelle collection</div>
          <h2>
            Éveillez votre <em>véritable essence</em>
          </h2>
          <p>Une nouvelle collection inspirée par la beauté de la nature et votre élégance.</p>
          <Link to="/#collections" className="ghost-link">
            Découvrir la collection <ArrowRightIcon size={15} strokeWidth={1.6} />
          </Link>
        </div>
        <div className="banner__image">
          <img src={banner} alt="Un flacon Lumé bleu nuit parmi les fleurs au coucher du soleil" width={1536} height={456} loading="lazy" />
        </div>
      </Reveal>
    </section>
  )
}
