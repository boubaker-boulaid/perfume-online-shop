import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowRightIcon } from './Icons'

// The white rounded button with a dark arrow circle, from the design.
export function PillLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="pill-link">
      {children}
      <span className="pill-link__arrow">
        <ArrowRightIcon size={15} strokeWidth={1.7} />
      </span>
    </Link>
  )
}
