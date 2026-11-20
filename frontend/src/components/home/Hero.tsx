import { Link } from 'react-router'
import heroMobile from '../../assets/images/home/hero-mobile.webp'
import heroSmall from '../../assets/images/home/hero-1400.webp'
import hero from '../../assets/images/home/hero.webp'

export function Hero() {
  return (
    <section className="hero">
      <div className="hero__image">
        {/* Phones get an upright photo cut around the bottle, bigger screens the wide one. */}
        <picture>
          <source media="(max-width: 767px)" srcSet={heroMobile} width={960} height={1200} />
          <img src={hero} srcSet={`${heroSmall} 1400w, ${hero} 2400w`} sizes="100vw" alt="" width={2400} height={1219} fetchPriority="high" />
        </picture>
      </div>

      <div className="hero__content">
        <h1 className="hero__title">
          Un soir
          <br />
          <mark>d’automne</mark>
        </h1>
        <p className="hero__text">Un parfum pour 19&nbsp;h&nbsp;12. Un pour minuit. Et un pour ce moment où il est soudain 4&nbsp;h&nbsp;43.</p>
        <Link to="/shop" className="button button--cream">
          Entrer dans la soirée
        </Link>
      </div>
    </section>
  )
}
