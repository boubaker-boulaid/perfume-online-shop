import { Link } from 'react-router'
import collections from '../../assets/images/home/collections.webp'
import { ArrowRightIcon } from '../Icons'
import { Reveal } from '../Reveal'
import { MapleLeaf } from './Botanicals'

export function CollectionsSection() {
  return (
    <section id="collections" className="split split--collections">
      <Reveal className="split__image">
        <img src={collections} alt="" width={1600} height={759} loading="lazy" />
      </Reveal>

      <Reveal className="split__content" delay={150}>
        <p className="tag">Nos collections</p>
        <h2 className="home-title">
          Collections
          <br />
          homme &amp; femme
        </h2>
        <p className="home-text">Deux collections, une même essence&nbsp;: l’élégance intemporelle. Découvrez notre sélection de parfums pour lui et pour elle.</p>
        <Link to="/shop" className="button button--accent">
          Voir la boutique <ArrowRightIcon size={15} strokeWidth={1.6} />
        </Link>
      </Reveal>

      <MapleLeaf className="home-art split__leaf" />
    </section>
  )
}
