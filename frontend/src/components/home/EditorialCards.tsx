import { Link } from 'react-router'
import forHer from '../../assets/images/home/for-her.webp'
import forHim from '../../assets/images/home/for-him.webp'
import { ArrowRightIcon } from '../Icons'
import { Reveal } from '../Reveal'

// The catalog has no men's or women's filter yet, so both cards open the whole shop.
const cards = [
  {
    key: 'him',
    image: forHim,
    width: 1677,
    height: 640,
    label: 'Collection homme',
    text: 'Certains instants méritent de durer un peu plus longtemps.',
    title: 'Pour lui',
    to: '/shop',
  },
  {
    key: 'her',
    image: forHer,
    width: 1800,
    height: 687,
    label: 'Collection femme',
    text: 'Pour ces moments où l’automne devient souvenir.',
    title: 'Pour elle',
    to: '/shop',
  },
]

export function EditorialCards() {
  return (
    <section className="container editorial">
      {cards.map((card, index) => (
        <Reveal key={card.key} delay={index * 150}>
          <Link to={card.to} className={`editorial-card editorial-card--${card.key}`}>
            <img src={card.image} alt="" width={card.width} height={card.height} loading="lazy" />
            <div className="editorial-card__top">
              <p className="editorial-card__label">{card.label}</p>
              <p className="editorial-card__text">{card.text}</p>
            </div>
            <div className="editorial-card__bottom">
              <h2 className="editorial-card__title">{card.title}</h2>
              <span className="arrow-link">
                Voir la collection <ArrowRightIcon size={15} strokeWidth={1.4} />
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </section>
  )
}
