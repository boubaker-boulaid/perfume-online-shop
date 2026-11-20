import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { useApi } from '../../hooks/useApi'
import { getCategories } from '../../services/api'
import { ArrowLeftIcon, ArrowRightIcon } from '../Icons'
import { Reveal } from '../Reveal'

const LOADING_SLIDES = 4

// The shop's categories. On phones they're a swipeable row. On desktop they sit
// side by side and the active one grows, as in the design.
export function CollectionCarousel() {
  const { data: categories = [] } = useApi(getCategories, 'categories')
  const [active, setActive] = useState(0)
  const track = useRef<HTMLDivElement>(null)
  const count = categories.length || LOADING_SLIDES

  const go = (direction: number) => {
    const next = (active + direction + count) % count
    const element = track.current

    setActive(next)

    // only does something where the row can scroll, which is on phones
    if (element && element.scrollWidth > element.clientWidth) {
      const slide = element.children[next] as HTMLElement
      element.scrollTo({ left: slide.offsetLeft - element.offsetLeft, behavior: 'smooth' })
    }
  }

  // keeps the counter right when the visitor swipes
  const onScroll = () => {
    const element = track.current
    if (!element || element.scrollWidth <= element.clientWidth) return

    const positions = Array.from(element.children, (child) => (child as HTMLElement).offsetLeft - element.offsetLeft)
    const closest = positions.reduce(
      (best, left, index) => (Math.abs(left - element.scrollLeft) < Math.abs(positions[best] - element.scrollLeft) ? index : best),
      0,
    )

    // the row can run out of room before the last slide reaches the left edge
    const atEnd = element.scrollLeft >= element.scrollWidth - element.clientWidth - 2
    const current = atEnd ? count - 1 : closest

    if (current !== active) setActive(current)
  }

  return (
    <div id="collections" className="container carousel">
      <Reveal className="carousel__bar">
        <div className="carousel__status">
          <div className="carousel__counter">
            {String(active + 1).padStart(2, '0')}
            <span>/{String(count).padStart(2, '0')}</span>
          </div>
          <div className="carousel__progress">
            <span style={{ width: `${((active + 1) / count) * 100}%` }} />
          </div>
        </div>
        <div className="carousel__arrows">
          <button type="button" className="icon-button" aria-label="Catégorie précédente" onClick={() => go(-1)}>
            <ArrowLeftIcon size={16} strokeWidth={1.6} />
          </button>
          <button type="button" className="icon-button" aria-label="Catégorie suivante" onClick={() => go(1)}>
            <ArrowRightIcon size={16} strokeWidth={1.6} />
          </button>
        </div>
      </Reveal>

      <div ref={track} className="carousel__track" onScroll={onScroll}>
        {categories.length === 0 && Array.from({ length: LOADING_SLIDES }, (_, index) => <div key={index} className="slide slide--loading" aria-hidden="true" />)}

        {categories.map((category, index) => (
          <Link key={category.id} to={`/shop?category=${category.slug}`} className={`slide${index === active ? ' is-active' : ''}`}>
            {category.image_path && <img src={category.image_path} alt="" width={556} height={446} loading="lazy" />}
            <div className="slide__shade" />
            <div className="slide__details">
              <div>
                <div className="slide__details-name">{category.name}</div>
                <p>{category.description}</p>
              </div>
              <div className="slide__time">
                {category.products_count} {category.products_count === 1 ? 'parfum' : 'parfums'}
              </div>
            </div>
            <div className="slide__name" aria-hidden="true">
              {category.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
