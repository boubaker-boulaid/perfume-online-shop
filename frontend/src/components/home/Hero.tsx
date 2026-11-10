import heroMobileMp4 from '../../assets/images/hero-mobile.mp4'
import heroMobileWebm from '../../assets/images/hero-mobile.webm'
import heroMp4 from '../../assets/images/hero.mp4'
import heroPosterMobile from '../../assets/images/hero-poster-mobile.webp'
import heroPoster from '../../assets/images/hero-poster.webp'
import heroWebm from '../../assets/images/hero.webm'
import { PillLink } from '../PillLink'

type NetworkInfo = { saveData?: boolean; effectiveType?: string }

// Phones get a small square video cut around the bottle, bigger screens the wide one.
const isPhone = window.matchMedia('(max-width: 639px)').matches
const video = isPhone
  ? { webm: heroMobileWebm, mp4: heroMobileMp4, poster: heroPosterMobile, width: 720, height: 720 }
  : { webm: heroWebm, mp4: heroMp4, poster: heroPoster, width: 1280, height: 720 }

// The video is only decoration, so it's skipped (and never downloaded) when the visitor saves data,
// is on a very slow connection, or asked for less motion. They see its first frame instead.
const connection = (navigator as Navigator & { connection?: NetworkInfo }).connection
const playVideo =
  !connection?.saveData &&
  !['slow-2g', '2g'].includes(connection?.effectiveType ?? '') &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function Hero() {
  return (
    <section className="hero">
      <div className="hero__image">
        {playVideo ? (
          // The 3 second loop is short and light (under 100 KB in most browsers)
          <video poster={video.poster} width={video.width} height={video.height} autoPlay muted loop playsInline aria-hidden="true">
            <source src={video.webm} type="video/webm" />
            <source src={video.mp4} type="video/mp4" />
          </video>
        ) : (
          <img src={video.poster} alt="" width={video.width} height={video.height} fetchPriority="high" />
        )}
      </div>
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
