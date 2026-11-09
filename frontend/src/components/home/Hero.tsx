import heroMobile from '../../assets/images/hero-mobile.webp'
import hero from '../../assets/images/hero.webp'
import { PillLink } from '../PillLink'

export function Hero() {
  return (
    <section className="hero">
      <picture className="hero__image">
        <source media="(min-width: 640px)" srcSet={hero} width={1600} height={901} />
        <img src={heroMobile} alt="" width={840} height={1859} fetchPriority="high" />
      </picture>
      <div className="hero__overlay" />

      <div className="hero__content">
        <p className="hero__kicker">Parfumerie en ligne · Livraison partout au Maroc</p>
        <h1 className="hero__title">
          Votre parfum,
          <br />
          livré chez <em>vous.</em>
        </h1>
        <div className="hero__lines">
          <div>Parfums originaux.</div>
          <div>Livraison gratuite.</div>
          <div>Vous payez à la réception.</div>
        </div>
        {/* <div className="hero__people">
          <div className="hero__avatars" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span className="hero__avatar-count">+28</span>
          </div>
          <span>Prêt à trouver le vôtre&nbsp;?</span>
        </div> */}
        <p className="hero__text">Choisissez votre parfum, confirmez sur WhatsApp, et payez le livreur en espèces.</p>
        <PillLink to="/shop">Voir les parfums</PillLink>
      </div>
    </section>
  )
}
