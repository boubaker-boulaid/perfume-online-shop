import { useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react'
import { Link } from 'react-router'
import { homeFragrances } from '../../data/homeFragrances'
import { useApi } from '../../hooks/useApi'
import { getProduct } from '../../services/api'
import { formatPrice } from '../../utils/format'
import { ArrowLeftIcon, ArrowRightIcon } from '../Icons'
import { Reveal } from '../Reveal'
import { Flask, LeafSprig } from './Botanicals'

const SWIPE_DISTANCE = 40 // px a finger must travel sideways to change bottle

const count = homeFragrances.length
const half = Math.floor(count / 2)

// A bottle that has left the catalog must not break the carousel, so it just loads as nothing.
const loadCatalogProducts = () => Promise.all(homeFragrances.map(({ slug }) => getProduct(slug).catch(() => null)))

// The bottles sit on an arc: the one in the middle is the biggest, and the others get smaller and
// lower towards the sides. The arrows, a swipe or a click on a side bottle turn the arc. It goes
// round in a circle, so there's no first or last bottle.
export function FragranceCarousel() {
  const { data: catalogProducts = [] } = useApi(loadCatalogProducts, 'home-fragrances')
  const [active, setActive] = useState(half)
  const swipeStart = useRef<number | null>(null)
  const swiped = useRef(false)

  // 0 is the middle, negative numbers are on its left
  const positionOf = (index: number) => ((index - active + count + half) % count) - half
  const go = (direction: number) => setActive((current) => (current + direction + count) % count)

  const onPointerDown = (event: PointerEvent) => {
    swipeStart.current = event.clientX
    swiped.current = false
  }

  const onPointerUp = (event: PointerEvent) => {
    if (swipeStart.current === null) return

    const distance = event.clientX - swipeStart.current
    swipeStart.current = null

    if (Math.abs(distance) < SWIPE_DISTANCE) return

    swiped.current = true // the click that follows a swipe must not open a bottle
    go(distance < 0 ? 1 : -1)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') go(-1)
    if (event.key === 'ArrowRight') go(1)
  }

  const onBottleClick = (event: MouseEvent, index: number) => {
    // A side bottle comes to the middle first. Only the middle one opens its page.
    if (swiped.current || index !== active) event.preventDefault()
    if (!swiped.current) setActive(index)
  }

  return (
    <section id="discover" className="fragrances">
      <Flask className="line-art fragrances__flask" />
      <LeafSprig className="line-art fragrances__leaves" />

      <Reveal className="fragrances__heading">
        <p className="eyebrow">Du crépuscule à l’aube.</p>
        <h2 className="display-title fragrances__title">Meilleures ventes</h2>
        <p className="fragrances__intro">Un parfum est plus qu’une odeur. C’est une émotion, un souvenir, un reflet de qui vous êtes.</p>
      </Reveal>

      <Reveal delay={150}>
        <div className="fragrances__stage" role="group" aria-roledescription="carrousel" aria-label="Nos parfums" onKeyDown={onKeyDown}>
          <ul className="fragrances__list" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (swipeStart.current = null)}>
            {homeFragrances.map((fragrance, index) => {
              const position = positionOf(index)
              const product = catalogProducts.find((item) => item?.slug === fragrance.slug)
              const category = product?.category.name
              const price = product?.price
              const to = product ? `/shop/${product.slug}` : '/shop'

              return (
                <li
                  key={fragrance.name}
                  className="fragrance"
                  data-distance={Math.abs(position)}
                  style={{ '--position': position } as CSSProperties}
                  aria-hidden={Math.abs(position) > 2}
                >
                  {/* For the mouse and fingers only. The keyboard uses the arrows and "Détails". */}
                  <Link to={to} className="fragrance__bottle" tabIndex={-1} aria-hidden="true" draggable={false} onClick={(event) => onBottleClick(event, index)}>
                    <img src={fragrance.image} alt="" width={480} height={620} loading="lazy" draggable={false} />
                  </Link>
                  <div className="fragrance__caption">
                    {/* a space keeps the line's height while the details load */}
                    <p className="fragrance__category">{category ?? '\u00a0'}</p>
                    <h3 className="fragrance__name">{fragrance.name}</h3>
                    <p className="fragrance__price">{price ? formatPrice(price) : '\u00a0'}</p>
                    <Link to={to} className="button button--accent button--small fragrance__details">
                      Détails
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="fragrances__arrows">
            <button type="button" className="round-button" aria-label="Parfum précédent" onClick={() => go(-1)}>
              <ArrowLeftIcon size={15} strokeWidth={1.4} />
            </button>
            <button type="button" className="round-button" aria-label="Parfum suivant" onClick={() => go(1)}>
              <ArrowRightIcon size={15} strokeWidth={1.4} />
            </button>
          </div>

          <p className="sr-only" role="status">
            {homeFragrances[active].name}, parfum {active + 1} sur {count}
          </p>
        </div>
      </Reveal>
    </section>
  )
}
