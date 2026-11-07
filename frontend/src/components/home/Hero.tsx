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
        <p className="hero__kicker">Votre parfumerie en ligne au Maroc</p>
        <h1 className="hero__title">
          Votre parfum,
          <br />
          livré chez <em>vous.</em>
        </h1>
        <div className="hero__lines">
          <div>Des parfums authentiques.</div>
          <div>Livraison offerte.</div>
          <div>Paiement à la livraison.</div>
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
        <p className="hero__text">Commandez en quelques clics, confirmez sur WhatsApp et payez en espèces à la réception.</p>
        <PillLink to="/shop">Découvrir la boutique</PillLink>
      </div>
    </section>
  )
}
