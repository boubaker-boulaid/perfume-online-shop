import { useEffect, useRef } from 'react'

// Marks an element as visible the first time it scrolls into view. The CSS does the animation.
export function useReveal<T extends Element>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('is-visible')
          observer.disconnect()
        }
      },
      { threshold: 0.08 },
    )

    // cards in a swipeable row appear with the row, so they're ready before they're swiped to
    observer.observe(element.closest('.best-sellers') ?? element)

    return () => observer.disconnect()
  }, [])

  return ref
}
