import type { ReactNode } from 'react'
import { useScrollReveal, type RevealVariant } from '../motion/useScrollReveal'

type Props = {
  children: ReactNode
  className?: string
  delay?: number
  // "content": the children rise one after the other. "image": a photo's frame opens out.
  variant?: RevealVariant
}

// Animates its content in when it scrolls into view. Don't wrap the product page's buy bar
// in this: a moving parent stops a fixed element staying on screen.
export function Reveal({ children, className, delay = 0, variant = 'content' }: Props) {
  const ref = useScrollReveal<HTMLDivElement>(variant, delay)

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
