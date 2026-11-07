import { Link } from 'react-router'
import { Logo } from '../Logo'
import { Reveal } from '../Reveal'

const columns = [
  {
    title: 'Boutique',
    links: [
      { label: 'Tous les parfums', to: '/shop' },
      { label: 'Pour elle', to: '/shop' },
      { label: 'Pour lui', to: '/shop' },
      { label: 'Unisexe', to: '/shop' },
      { label: 'Coffrets cadeaux', to: '/shop' },
    ],
  },
  {
    title: 'Collections',
    links: [
      { label: 'Meilleures ventes', to: '/#collections' },
      { label: 'Nouveautés', to: '/#collections' },
      { label: 'Édition limitée', to: '/#collections' },
      { label: 'Coffrets découverte', to: '/#collections' },
    ],
  },
  {
    title: 'Service client',
    links: [
      { label: 'Expédition et livraison', to: '/#contact' },
      { label: 'Retours et échanges', to: '/#contact' },
      { label: 'FAQ', to: '/#contact' },
      { label: 'Suivre ma commande', to: '/#contact' },
    ],
  },
  {
    title: 'La maison',
    links: [
      { label: 'À propos', to: '/#about' },
      { label: 'Nos ingrédients', to: '/#about' },
      { label: 'Durabilité', to: '/#about' },
      { label: 'Nous contacter', to: '/#contact' },
    ],
  },
]

const socials = ['In', 'Fb', 'Tk', 'Pt']

export function Footer() {
  return (
    <footer className="site-footer container">
      <Reveal className="site-footer__grid">
        <div className="site-footer__brand">
          <Logo />
          <p>Nous créons des parfums inoubliables qui inspirent, donnent confiance et laissent une empreinte durable.</p>
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
              {column.links.map((link) => (
                <Link key={link.label} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </Reveal>

      <div className="site-footer__bottom">
        <div>© 2026 Lumé Parfums. Tous droits réservés.</div>
        <div className="site-footer__legal">
          <a href="#top">Politique de confidentialité</a>
          <a href="#top">Conditions générales</a>
        </div>
      </div>
    </footer>
  )
}
