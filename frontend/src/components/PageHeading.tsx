import type { ReactNode } from 'react'
import { Breadcrumbs, type Crumb } from './Breadcrumbs'

type Props = {
  eyebrow?: string
  title: ReactNode
  children?: ReactNode
  // the pages above this one, for the breadcrumbs
  trail?: Crumb[]
  center?: boolean
}

export function PageHeading({ eyebrow, title, children, trail, center = false }: Props) {
  return (
    <header className={`page-heading${center ? ' page-heading--center' : ''}`}>
      {trail && <Breadcrumbs trail={trail} />}
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </header>
  )
}
