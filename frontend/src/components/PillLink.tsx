import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowRightIcon } from './Icons'

// The black button with an arrow, as on the home page.
export function PillLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="button button--accent">
      {children}
      <ArrowRightIcon size={15} strokeWidth={1.6} />
    </Link>
  )
}
