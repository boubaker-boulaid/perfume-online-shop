import type { CSSProperties, ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'

type Props = {
  children: ReactNode
  className?: string
  delay?: number
}

// Fades its content up when it scrolls into view. Don't wrap the product page's
// buy bar in this: a moving parent stops a fixed element staying on screen.
export function Reveal({ children, className = '', delay = 0 }: Props) {
  const ref = useReveal<HTMLDivElement>()

  return (
    <div ref={ref} className={`reveal ${className}`} style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  )
}
