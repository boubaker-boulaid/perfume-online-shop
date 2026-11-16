import { useRef } from 'react'
import { Link, useLocation } from 'react-router'
import { useCart } from '../../context/cartContext'
import { BagIcon, CloseIcon, MenuIcon } from '../Icons'
import { Logo } from '../Logo'

const links = [
  { label: 'Accueil', to: '/' },
  { label: 'Boutique', to: '/shop' },
  { label: 'Offres', to: '/offers' },
  { label: 'Collections', to: '/#collections' },
  { label: 'Nouveautés', to: '/#discover' },
  { label: 'Qui sommes-nous', to: '/#about' },
  { label: 'Contact', to: '/#contact' },
]

// On the home page the logo sits in the middle of the bar, with this many links on its left
// and the rest on its right.
const LINKS_BEFORE_LOGO = 4

// `home` gives the home page's look: an announcement line, then a white bar with the logo in the
// middle. The links, the bag and the menu are the same on every page.
export function Header({ home = false }: { home?: boolean }) {
  const { count } = useCart()
  const { pathname, hash } = useLocation()
  const menu = useRef<HTMLDialogElement>(null)

  const isActive = (to: string) => {
    if (!to.startsWith('/#') && to !== '/') return pathname.startsWith(to)
    return `${pathname}${hash}` === to
  }

  const closeMenu = () => menu.current?.close()

  const actions = (
    <div className="site-header__actions">
      <Link to="/cart" className="icon-button icon-button--large" aria-label={`Panier, ${count} article${count > 1 ? 's' : ''}`}>
        <BagIcon size={19} />
        {count > 0 && <span key={count} className="cart-count">{count > 99 ? '99+' : count}</span>}
      </Link>
      <button type="button" className="icon-button icon-button--large" aria-label="Ouvrir le menu" onClick={() => menu.current?.showModal()}>
        <MenuIcon strokeWidth={1.6} />
      </button>
    </div>
  )

  const menuPanel = (
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
  )

  if (home) {
    const homeLink = (link: (typeof links)[number]) => (
      <Link key={link.to} to={link.to} className={`home-nav__link${isActive(link.to) ? ' is-active' : ''}`}>
        {link.label}
      </Link>
    )

    return (
      <header className="home-header">
        <p className="home-header__announcement">
          Livraison gratuite partout au Maroc <span aria-hidden="true">·</span> Paiement à la réception
        </p>

        <div className="home-header__bar">
          <nav className="home-nav" aria-label="Navigation principale">
            {links.slice(0, LINKS_BEFORE_LOGO).map(homeLink)}
          </nav>

          <Link to="/" className="home-header__logo" aria-label="Accueil Lumé Parfums">
            <Logo />
          </Link>

          <div className="home-header__end">
            <nav className="home-nav home-nav--end" aria-label="Navigation principale, suite">
              {links.slice(LINKS_BEFORE_LOGO).map(homeLink)}
            </nav>
            {actions}
          </div>
        </div>

        {menuPanel}
      </header>
    )
  }

  return (
    <header className="site-header">
      <Link to="/" className="site-header__logo" aria-label="Accueil Lumé Parfums">
        <Logo />
      </Link>

      <nav className="site-nav" aria-label="Navigation principale">
        {links.map((link) => (
          <Link key={link.to} to={link.to} className={`site-nav__link${isActive(link.to) ? ' is-active' : ''}`}>
            {link.label}
          </Link>
        ))}
      </nav>

      {actions}
      {menuPanel}
    </header>
  )
}
