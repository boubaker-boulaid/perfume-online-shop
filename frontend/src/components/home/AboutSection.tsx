import about from '../../assets/images/home/about.webp'
import { WHATSAPP_URL } from '../../utils/whatsapp'
import { ArrowRightIcon } from '../Icons'
import { Reveal } from '../Reveal'
import { MapleLeaf } from './Botanicals'

export function AboutSection() {
  return (
    <section id="about" className="split split--about">
      <MapleLeaf className="line-art split__leaf" />

      <Reveal className="split__content">
        <p className="eyebrow">Notre histoire</p>
        <h2 className="display-title">À propos de Lumé</h2>
        <p className="body-text">
          Lumé a commencé à Agadir en 2019 avec quelques flacons vendus à la famille et aux amis. Aujourd’hui on livre partout au Maroc, mais on travaille toujours pareil&nbsp;: on choisit nos
          parfums un par un, et on ne vend que ce qu’on a déjà senti nous-mêmes. Parce qu’un parfum est plus qu’une odeur&nbsp;: c’est une signature.
        </p>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="button button--accent">
          Nous écrire sur WhatsApp <ArrowRightIcon size={15} strokeWidth={1.6} />
        </a>
      </Reveal>

      <Reveal className="split__image" delay={150} variant="image">
        <img src={about} alt="" width={1800} height={740} loading="lazy" />
      </Reveal>
    </section>
  )
}
