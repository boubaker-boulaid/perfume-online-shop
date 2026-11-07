import { useRef } from 'react'
import { Link, useLocation } from 'react-router'
import { useCart } from '../../context/cartContext'
import { BagIcon, CloseIcon, MenuIcon } from '../Icons'
import { Logo } from '../Logo'

const links = [
  { label: 'Accueil', to: '/' },
  { label: 'Boutique', to: '/shop' },
  { label: 'Collections', to: '/#collections' },
  { label: 'Découvrir', to: '/#discover' },
  { label: 'À propos', to: '/#about' },
  { label: 'Contact', to: '/#contact' },
]

export function Header() {
  const { count } = useCart()
  const { pathname, hash } = useLocation()
  const menu = useRef<HTMLDialogElement>(null)

  const isActive = (to: string) => {
    if (to === '/shop') return pathname.startsWith('/shop')
    return `${pathname}${hash}` === to
  }

  const closeMenu = () => menu.current?.close()

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

      <div className="site-header__actions">
        <Link to="/cart" className="icon-button icon-button--large" aria-label={`Panier, ${count} article${count > 1 ? 's' : ''}`}>
          <BagIcon size={19} />
          {count > 0 && <span key={count} className="cart-count">{count > 99 ? '99+' : count}</span>}
        </Link>
        <button type="button" className="icon-button icon-button--large" aria-label="Ouvrir le menu" onClick={() => menu.current?.showModal()}>
          <MenuIcon strokeWidth={1.6} />
        </button>
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
