import { Link } from 'react-router'
import { Logo } from '../Logo'
import { Reveal } from '../Reveal'
import { WHATSAPP_URL } from '../../utils/whatsapp'

const columns = [
  {
    title: 'Boutique',
    links: [
      { label: 'Tous les parfums', to: '/shop' },
      { label: 'Promos', to: '/offers' },
      { label: 'Femme', to: '/shop' },
      { label: 'Homme', to: '/shop' },
      { label: 'Mixte', to: '/shop' },
      { label: 'Coffrets cadeaux', to: '/shop' },
    ],
  },
  {
    title: 'Collections',
    links: [
      { label: 'Les plus vendus', to: '/#collections' },
      { label: 'Nouveautés', to: '/#collections' },
      { label: 'Packs', to: '/offers' },
    ],
  },
  {
    title: 'Aide',
    links: [
      { label: 'Livraison', to: '/#contact' },
      { label: 'Échanges', to: '/#contact' },
      { label: 'Questions fréquentes', to: '/#contact' },
      { label: 'Suivre ma commande', to: '/#contact' },
    ],
  },
  {
    title: 'Lumé',
    links: [
      { label: 'Qui sommes-nous', to: '/#about' },
      { label: 'Contact', to: '/#contact' },
      { label: 'WhatsApp', to: WHATSAPP_URL },
    ],
  },
]

const socials = ['In', 'Fb', 'Tk']

export function Footer() {
  return (
    <footer className="site-footer container">
      <Reveal className="site-footer__grid">
        <div className="site-footer__brand">
          <Logo />
          <p>Parfums originaux, livrés partout au Maroc. Vous payez à la réception.</p>
          <div className="site-footer__socials">
            {socials.map((social) => (
              <a key={social} href="#top">
                {social}
              </a>
            ))}
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="site-footer__title">{column.title}</h2>
            <div className="site-footer__links">
              {column.links.map((link) =>
                // links to other sites, like WhatsApp, open in a new tab
                link.to.startsWith('https://') ? (
                  <a key={link.label} href={link.to} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.label} to={link.to}>
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          </div>
        ))}
      </Reveal>

      <div className="site-footer__bottom">
        <div>© 2026 Lumé Parfums</div>
        <div className="site-footer__legal">
          <a href="#top">Confidentialité</a>
          <a href="#top">Conditions de vente</a>
        </div>
      </div>
    </footer>
  )
}
