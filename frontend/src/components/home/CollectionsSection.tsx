import { Link } from 'react-router'
import { ArrowRightIcon } from '../Icons'
import { Reveal } from '../Reveal'
import { MapleLeaf } from './Botanicals'

export function CollectionsSection() {
  return (
    <section id="collections" className="split split--collections">
      <Reveal className="split__content">
        <p className="eyebrow">Nos collections</p>
        <h2 className="display-title">
          Collections
          <br />
          homme &amp; femme
        </h2>
        <p className="body-text">Deux collections, une même essence&nbsp;: l’élégance intemporelle. Découvrez notre sélection de parfums pour lui et pour elle.</p>
        <Link to="/shop" className="button button--accent">
          Voir la boutique <ArrowRightIcon size={15} strokeWidth={1.6} />
        </Link>
      </Reveal>

      <MapleLeaf className="line-art split__leaf" />
    </section>
  )
}
