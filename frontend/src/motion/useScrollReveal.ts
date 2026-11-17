import { useLayoutEffect, useRef } from 'react'
import { gsap, MOTION_OK, ScrollTrigger, SplitText } from './gsap'

// The scroll animations. They move CSS variables ("--reveal-y", "--reveal-scale", "--parallax-y")
// that motion.css turns into "translate" and "scale", and never "transform" itself: buttons, cards
// and photos already animate their transform on hover and touch, and the two would fight.
// Everything is set before the first paint (useLayoutEffect), so nothing flashes or jumps, and
// nothing changes size, so the page never shifts.

export type RevealVariant = 'content' | 'image'

// Starts when the top of the element is 12% above the bottom of the screen. The last things on
// a short page can never scroll that high: they start just before the end of the page instead.
// (ScrollTrigger's own "clamp()" would also stop things already on screen at the top playing.)
const startFor = (element: Element) => () => {
  const natural = element.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.88
  return Math.min(natural, ScrollTrigger.maxScroll(window) - 1)
}

const riseDistance = () => (window.innerWidth < 768 ? 22 : 36)

const clear = (element: HTMLElement) => {
  element.classList.remove('reveal-item', 'reveal-image')
  element.style.removeProperty('--reveal-y')
  element.style.removeProperty('--reveal-scale')
  gsap.set(element, { clearProps: 'opacity,clipPath' })
}

// A large heading arrives line by line, each line sliding up from behind its own edge.
// The lines go back to plain text when it's done.
function revealTitle(title: HTMLElement) {
  const split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'reveal-line' })
  gsap.set(title, { opacity: 1 })

  return gsap.from(split.lines, {
    yPercent: 125, // fully below the edge, which is a little outside the line
    duration: 1.3,
    ease: 'power4.out',
    stagger: 0.12,
    onComplete: () => split.revert(),
  })
}

// Text and buttons: each child rises in turn, a large heading line by line.
function setUpContent(element: HTMLElement, delay: number) {
  const items = element.children.length > 1 ? (Array.from(element.children) as HTMLElement[]) : [element]
  const isTitle = (item: HTMLElement) => item.matches('.display-title')
  const distance = riseDistance()

  items.forEach((item) => {
    gsap.set(item, { opacity: 0 })
    if (isTitle(item)) return
    item.classList.add('reveal-item')
    item.style.setProperty('--reveal-y', `${distance}px`)
  })

  const play = () => {
    const timeline = gsap.timeline({ delay, onComplete: () => items.forEach(clear) })

    items.forEach((item, index) => {
      const at = index * 0.12
      if (isTitle(item)) {
        timeline.add(revealTitle(item), at)
      } else {
        timeline.to(item, { opacity: 1, duration: 1.1, ease: 'power2.out' }, at)
        timeline.to(item, { '--reveal-y': '0px', duration: 1.4, ease: 'power3.out' }, at)
      }
    })
  }

  return { play, cleanUp: () => items.forEach(clear) }
}

// Photos: the frame opens out from a slightly smaller rectangle while the photo settles.
function setUpImage(element: HTMLElement, delay: number) {
  gsap.set(element, { opacity: 0, clipPath: 'inset(8% 6% 8% 6%)' })
  element.classList.add('reveal-image')
  element.style.setProperty('--reveal-scale', '1.12')

  const play = () => {
    gsap
      .timeline({ delay, onComplete: () => clear(element) })
      .to(element, { opacity: 1, duration: 0.8, ease: 'power1.out' }, 0)
      .to(element, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'power3.inOut' }, 0)
      .to(element, { '--reveal-scale': 1, duration: 1.9, ease: 'power3.out' }, 0)
  }

  return { play, cleanUp: () => clear(element) }
}

export function useScrollReveal<T extends HTMLElement>(variant: RevealVariant = 'content', delayMs = 0) {
  const ref = useRef<T>(null)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    const media = gsap.matchMedia()

    media.add(MOTION_OK, () => {
      const setUp = variant === 'image' ? setUpImage : setUpContent
      const { play, cleanUp } = setUp(element, delayMs / 1000)

      ScrollTrigger.create({ trigger: element, start: startFor(element), once: true, onEnter: play })

      return cleanUp
    })

    return () => media.revert()
  }, [variant, delayMs])

  return ref
}

// Product and offer cards. Cards that come into view together rise one after the other, a
// little apart, instead of all at once or each on its own clock.
const queue: HTMLElement[] = []
let flushQueued = false

function revealCards() {
  flushQueued = false

  queue.splice(0).forEach((card, index) => {
    gsap.to(card, {
      opacity: 1,
      '--reveal-y': '0px',
      duration: 1.1,
      delay: index * 0.09,
      ease: 'power3.out',
      onComplete: () => clear(card),
    })
  })
}

export function useCardReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useLayoutEffect(() => {
    const card = ref.current
    if (!card) return

    const media = gsap.matchMedia()

    media.add(MOTION_OK, () => {
      gsap.set(card, { opacity: 0 })
      card.classList.add('reveal-item')
      card.style.setProperty('--reveal-y', `${riseDistance()}px`)

      // cards in a swipeable row appear with the row, so they're ready before they're swiped to
      const trigger = card.closest('.best-sellers') ?? card

      ScrollTrigger.create({
        trigger,
        start: startFor(trigger),
        once: true,
        onEnter: () => {
          queue.push(card)
          if (!flushQueued) {
            flushQueued = true
            requestAnimationFrame(revealCards)
          }
        },
      })

      return () => {
        const waiting = queue.indexOf(card)
        if (waiting >= 0) queue.splice(waiting, 1)
        clear(card)
      }
    })

    return () => media.revert()
  }, [])

  return ref
}

type ParallaxOptions = {
  from: string
  to: string
  // where the movement starts; it ends when the element's section leaves the top of the screen
  start?: string
}

// A slow drift as the page scrolls, for the hero photo and the line drawings. Only on large
// screens: on phones it costs more than it gives.
export function useParallax(selector: string, { from, to, start = 'top bottom' }: ParallaxOptions) {
  useLayoutEffect(() => {
    const media = gsap.matchMedia()

    media.add(`${MOTION_OK} and (min-width: 1024px)`, () => {
      const elements = gsap.utils.toArray<HTMLElement>(selector)

      elements.forEach((element) => {
        element.classList.add('parallax')
        gsap.fromTo(
          element,
          { '--parallax-y': from },
          {
            '--parallax-y': to,
            ease: 'none',
            // the section, not the element itself, which moves
            scrollTrigger: { trigger: element.parentElement, start, end: 'bottom top', scrub: true },
          },
        )
      })

      return () => elements.forEach((element) => element.classList.remove('parallax'))
    })

    return () => media.revert()
  }, [selector, from, to, start])
}
