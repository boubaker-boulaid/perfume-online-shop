import about from '../../assets/images/about.webp'
import { WHATSAPP_URL } from '../../utils/whatsapp'
import { ArrowRightIcon } from '../Icons'
import { Reveal } from '../Reveal'

const stats = [
  { value: '2019', label: 'Depuis' },
  { value: '+3000', label: 'Clients livrés' },
  { value: '60+', label: 'Parfums en stock' },
]

export function AboutSection() {
  return (
    <section id="about" className="container section section--wide about">
      <Reveal className="about__image">
        <img src={about} alt="Des flacons de parfum posés près d’un livre ouvert" width={860} height={510} loading="lazy" />
      </Reveal>
      <Reveal delay={200}>
        <div className="eyebrow">Qui sommes-nous</div>
        <h2 className="display-title">
          Une petite parfumerie, <em>de confiance</em>
        </h2>
        <p className="about__text">
          Lumé a commencé à Agadir en 2019 avec quelques flacons vendus à la famille et aux amis. Aujourd’hui on livre partout au Maroc, mais on travaille toujours pareil : on choisit nos parfums
          un par un, et on ne vend que ce qu’on a déjà senti nous-mêmes.
        </p>
        <p className="about__text">
          Vous hésitez entre deux parfums&nbsp;? Envoyez-nous un message sur WhatsApp, on vous conseille selon vos goûts et votre budget.
        </p>
        <div className="about__stats">
          {stats.map((stat) => (
            <div key={stat.label} className="stat">
              <div className="stat__value">{stat.value}</div>
              <div className="stat__label">{stat.label}</div>
            </div>
          ))}
        </div>
        {/* Same look as PillLink, but it opens WhatsApp in a new tab */}
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="pill-link">
          Nous écrire sur WhatsApp
          <span className="pill-link__arrow">
            <ArrowRightIcon size={15} strokeWidth={1.7} />
          </span>
        </a>
      </Reveal>
    </section>
  )
}
