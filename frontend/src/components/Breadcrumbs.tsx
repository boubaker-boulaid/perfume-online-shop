import { Link } from 'react-router'

export type Crumb = { label: string; to?: string }

// "Accueil / Boutique / Sauvage". The last crumb is the page you're on, so it isn't a link.
export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  const crumbs: Crumb[] = [{ label: 'Accueil', to: '/' }, ...trail]

  return (
    <nav className="breadcrumbs" aria-label="Fil d’Ariane">
      <ol>
        {crumbs.map((crumb, index) =>
          index < crumbs.length - 1 && crumb.to ? (
            <li key={crumb.label}>
              <Link to={crumb.to}>{crumb.label}</Link>
            </li>
          ) : (
            <li key={crumb.label}>
              <span aria-current={index === crumbs.length - 1 ? 'page' : undefined}>{crumb.label}</span>
            </li>
          ),
        )}
      </ol>
    </nav>
  )
}
