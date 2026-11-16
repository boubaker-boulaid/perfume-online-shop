import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from '../../utils/whatsapp'
import { ArrowUpIcon, FacebookIcon, InstagramIcon, MailIcon, PinIcon, TikTokIcon, WhatsAppIcon } from '../Icons'
import { Logo } from '../Logo'
import { Reveal } from '../Reveal'
import { PressedLeaves } from './Botanicals'

// The same links and details as the rest of the site's footer and the contact section.
const columns = [
  {
    title: 'Liens rapides',
    links: [
      { label: 'Boutique', to: '/shop' },
      { label: 'Offres', to: '/offers' },
      { label: 'Collections', to: '/#collections' },
      { label: 'Qui sommes-nous', to: '/#about' },
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
]

const EMAIL = 'contact@lumeparfums.ma'

const contacts: { icon: ReactNode; label: string; href?: string }[] = [
  { icon: <MailIcon size={17} />, label: EMAIL, href: `mailto:${EMAIL}` },
  { icon: <WhatsAppIcon size={15} />, label: WHATSAPP_DISPLAY, href: WHATSAPP_URL },
  { icon: <PinIcon size={17} />, label: 'Agadir, Maroc' },
]

// The shop's social pages aren't known yet, so these go to the top of the page for now.
const socials = [
  { label: 'Instagram', icon: <InstagramIcon size={17} /> },
  { label: 'Facebook', icon: <FacebookIcon size={17} /> },
  { label: 'TikTok', icon: <TikTokIcon size={16} /> },
]

export function HomeFooter() {
  return (
    <footer className="home-footer">
      <PressedLeaves className="home-footer__leaves home-footer__leaves--left" />
      <PressedLeaves className="home-footer__leaves home-footer__leaves--right" />

      <div className="home-container">
        <Reveal className="home-footer__grid">
          <div className="home-footer__brand">
            <Logo />
            <p>Parfums originaux, livrés partout au Maroc. Vous payez à la réception.</p>
            <div className="home-footer__socials">
              {socials.map((social) => (
                <a key={social.label} href="#top" aria-label={social.label}>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="home-footer__title">{column.title}</h2>
              <ul className="home-footer__links">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="home-footer__title">Contact</h2>
            <ul className="home-footer__links home-footer__links--contact">
              {contacts.map((contact) => (
                <li key={contact.label}>
                  {contact.icon}
                  {contact.href ? (
                    // links to other sites, like WhatsApp, open in a new tab
                    <a href={contact.href} {...(contact.href.startsWith('https://') && { target: '_blank', rel: 'noreferrer' })}>
                      {contact.label}
                    </a>
                  ) : (
                    <span>{contact.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div className="home-footer__bottom">
          <div>© 2026 Lumé Parfums</div>
          <div className="home-footer__legal">
            <a href="#top">Confidentialité</a>
            <span aria-hidden="true">|</span>
            <a href="#top">Conditions de vente</a>
          </div>
          <a href="#top" className="home-footer__top" aria-label="Retour en haut de la page">
            <ArrowUpIcon size={15} strokeWidth={1.6} />
          </a>
        </div>
      </div>
    </footer>
  )
}
