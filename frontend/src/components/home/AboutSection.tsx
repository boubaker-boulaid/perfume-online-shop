import about from '../../assets/images/about.webp'
import { PillLink } from '../PillLink'
import { Reveal } from '../Reveal'

const stats = [
  { value: '2016', label: 'Fondée à Agadir' },
  { value: '42', label: 'Ingrédients naturels' },
  { value: '18k', label: 'Flacons par an' },
]

export function AboutSection() {
  return (
    <section id="about" className="container section section--wide about">
      <Reveal className="about__image">
        <img src={about} alt="Trois flacons de parfum Lumé côte à côte" width={860} height={510} loading="lazy" />
      </Reveal>
      <Reveal delay={200}>
        <div className="eyebrow">À propos</div>
        <h2 className="display-title">
          Un parfum créé lentement, en <em>petites séries</em>
        </h2>
        <p className="about__text">
          Lumé est née en 2016 d’un seul mélange de jasmin et de cèdre, préparé dans la cuisine d’un atelier et offert à des amis. Dix ans plus tard, nous travaillons toujours de la même façon :
          petites séries, matières naturelles et une formule achevée seulement lorsqu’elle sent le souvenir.
        </p>
        <p className="about__text">
          Chaque parfum est assemblé et mis en flacon dans notre atelier d’Agadir, puis repose six semaines avant de vous parvenir. Nous nous fournissons auprès de producteurs que nous rencontrons
          en personne, et chaque ingrédient figure sur l’étiquette.
        </p>
        <div className="about__stats">
          {stats.map((stat) => (
            <div key={stat.label} className="stat">
              <div className="stat__value">{stat.value}</div>
              <div className="stat__label">{stat.label}</div>
            </div>
          ))}
        </div>
        <PillLink to="/#contact">Visiter l’atelier</PillLink>
      </Reveal>
    </section>
  )
}
