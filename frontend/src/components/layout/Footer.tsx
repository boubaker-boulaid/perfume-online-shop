import type { ComponentProps, ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from '../../utils/whatsapp'
import { PressedLeaves } from '../home/Botanicals'
import { ArrowUpIcon, FacebookIcon, InstagramIcon, MailIcon, PinIcon, TikTokIcon, WhatsAppIcon } from '../Icons'
import { Logo } from '../Logo'
import { Reveal } from '../Reveal'

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
    ],
  },
]

const EMAIL = 'contact@lumeparfums.ma'

// The same details as the home page's contact section.
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

// Back to the top of the page. It goes through the router like the section links, so it glides
// up instead of jumping, and the address still ends in "#top" without losing the shop's filters.
function TopLink(props: Omit<ComponentProps<typeof Link>, 'to'>) {
  const { search } = useLocation()
  return <Link to={{ search, hash: '#top' }} {...props} />
}

export function Footer() {
  return (
    <footer className="site-footer">
      <PressedLeaves className="site-footer__leaves site-footer__leaves--left" />
      <PressedLeaves className="site-footer__leaves site-footer__leaves--right" />

      <div className="container">
        <Reveal className="site-footer__grid">
          <div className="site-footer__brand">
            <Logo />
            <p>Parfums originaux, livrés partout au Maroc. Vous payez à la réception.</p>
            <div className="site-footer__socials">
              {socials.map((social) => (
                <TopLink key={social.label} aria-label={social.label}>
                  {social.icon}
                </TopLink>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="site-footer__title">{column.title}</h2>
              <ul className="site-footer__links">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="site-footer__contact">
            <h2 className="site-footer__title">Nous contacter</h2>
            <ul className="site-footer__links site-footer__links--contact">
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

        <div className="site-footer__bottom">
          <div>© 2026 Lumé Parfums</div>
          <div className="site-footer__legal">
            <TopLink>Confidentialité</TopLink>
            <span aria-hidden="true">|</span>
            <TopLink>Conditions de vente</TopLink>
          </div>
          <TopLink className="site-footer__top" aria-label="Retour en haut de la page">
            <ArrowUpIcon size={15} strokeWidth={1.6} />
          </TopLink>
        </div>
      </div>
    </footer>
  )
}
