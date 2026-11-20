import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useCart } from '../../context/cartContext'
import { BagIcon, CloseIcon, MenuIcon } from '../Icons'
import { Logo } from '../Logo'
import { DemoNotice } from '../DemoNotice'

const links = [
  { label: 'Accueil', to: '/' },
  { label: 'Boutique', to: '/shop' },
  { label: 'Offres', to: '/offers' },
  { label: 'Nouveautés', to: '/#discover' },
  { label: 'Qui sommes-nous', to: '/#about' },
  { label: 'Contact', to: '/#contact' },
]

// The logo sits in the middle of the bar, with this many links on its left and the rest on
// its right. On phones the links are in the menu instead.
const LINKS_BEFORE_LOGO = 3

const SECTION_IDS = links.filter((link) => link.to.startsWith('/#')).map((link) => link.to.slice(2))

// On the home page, the section the visitor is reading as they scroll: the block of the page
// across a thin band at 35% of the screen's height. A block without a link (the hero, the
// collections, the footer...) means "Accueil". In the space between two blocks the last link
// stays on, so it doesn't flicker. An IntersectionObserver reports the blocks crossing the band:
// there's no scroll listener, and nothing is measured on every frame.
function useSectionInView(enabled: boolean) {
  const [inView, setInView] = useState<string | null>(null)

  useEffect(() => {
    const main = document.querySelector('main')
    if (!enabled || !main?.parentElement) return

    // in page order, so when two are in the band, the lower one (which has just arrived) wins
    const blocks = [...main.children, ...[...main.parentElement.children].filter((block) => block !== main && block.tagName !== 'HEADER')]
    const inBand = new Set<Element>()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => (entry.isIntersecting ? inBand.add(entry.target) : inBand.delete(entry.target)))
        const block = [...blocks].reverse().find((candidate) => inBand.has(candidate))
        if (block) setInView(SECTION_IDS.includes(block.id) ? block.id : null)
      },
      { rootMargin: '-35% 0px -64% 0px' },
    )
    blocks.forEach((block) => observer.observe(block))

    return () => {
      observer.disconnect()
      setInView(null)
    }
  }, [enabled])

  return inView
}

export function Header() {
  const { count } = useCart()
  const { pathname } = useLocation()
  const menu = useRef<HTMLDialogElement>(null)
  const isHome = pathname === '/'
  const sectionInView = useSectionInView(isHome)

  // On the home page the active link follows the scroll: a section's link while it's on screen,
  // "Accueil" elsewhere on the page.
  const isActive = (to: string) => {
    if (!to.startsWith('/#') && to !== '/') return pathname.startsWith(to)
    if (!isHome) return false
    return to === '/' ? sectionInView === null : to === `/#${sectionInView}`
  }

  const closeMenu = () => menu.current?.close()

  const navLink = (link: (typeof links)[number]) => (
    <Link key={link.to} to={link.to} className={`site-nav__link${isActive(link.to) ? ' is-active' : ''}`}>
      {link.label}
    </Link>
  )

  return (
    <header className="site-header">
      <DemoNotice />
      <p className="site-header__announcement">
        Livraison gratuite partout au Maroc <span aria-hidden="true">·</span> Paiement à la réception
      </p>

      <div className="site-header__bar">
        <nav className="site-nav" aria-label="Navigation principale">
          {links.slice(0, LINKS_BEFORE_LOGO).map(navLink)}
        </nav>

        <Link to="/" className="site-header__logo" aria-label="Accueil Lumé Parfums">
          <Logo />
        </Link>

        <div className="site-header__end">
          <nav className="site-nav site-nav--end" aria-label="Navigation principale, suite">
            {links.slice(LINKS_BEFORE_LOGO).map(navLink)}
          </nav>

          <div className="site-header__actions">
            <Link to="/cart" className="icon-button icon-button--large" aria-label={`Panier, ${count} article${count > 1 ? 's' : ''}`}>
              <BagIcon size={19} />
              {count > 0 && <span key={count} className="cart-count">{count > 99 ? '99+' : count}</span>}
            </Link>
            <button type="button" className="icon-button icon-button--large" aria-label="Ouvrir le menu" onClick={() => menu.current?.showModal()}>
              <MenuIcon strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </div>

      <dialog ref={menu} className="menu-panel" aria-label="Menu">
        <div className="menu-panel__top">
          <Logo />
          <button type="button" className="icon-button icon-button--large" aria-label="Fermer le menu" onClick={closeMenu}>
            <CloseIcon />
          </button>
        </div>
        <nav className="menu-panel__links" aria-label="Menu">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={isActive(link.to) ? 'is-active' : undefined} onClick={closeMenu}>
              {link.label}
            </Link>
          ))}
        </nav>
      </dialog>
    </header>
  )
}
