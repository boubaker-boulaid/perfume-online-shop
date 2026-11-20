import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap, prefersReducedMotion, ScrollTrigger } from './gsap'

// One Lenis for the whole site. It smooths the mouse wheel and trackpad only: phones keep their
// own touch scrolling, which already feels natural. The page still scrolls natively underneath,
// so fixed elements, the back button and the browser's own scroll position all keep working.
let lenis: Lenis | null = null

// How far below the top of the screen a section lands: the CSS's "scroll-padding-top", which
// Lenis and the browser both apply by themselves.
const sectionOffset = () => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0

// Slows down gently to the end, without the near-instant start of an exponential curve
const easeOutQuart = (t: number) => 1 - (1 - t) ** 4

export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) return () => {}

  const instance = new Lenis({
    lerp: 0.11, // light smoothing: the page follows the wheel closely, with no floaty delay
    autoRaf: false,
    // the menu scrolls by itself, as before
    prevent: (node) => node.nodeName === 'DIALOG',
  })

  // GSAP's clock drives Lenis, so the scroll and the scroll animations move on the same frame
  instance.on('scroll', ScrollTrigger.update)
  const tick = (time: number) => instance.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  lenis = instance

  return () => {
    gsap.ticker.remove(tick)
    instance.destroy()
    lenis = null
  }
}

// Section links (/#about...). The trip takes longer for far sections, but never drags.
export function scrollToElement(element: HTMLElement) {
  if (!lenis) {
    element.scrollIntoView()
    return
  }

  const smooth = lenis
  const missedBy = () => Math.abs(element.getBoundingClientRect().top - sectionOffset())
  const atPageEnd = () => smooth.scroll >= smooth.limit - 1 // a section near the end can't reach the top

  smooth.scrollTo(element, {
    duration: Math.min(0.9 + missedBy() / 3000, 1.8),
    easing: easeOutQuart,
    // Coming from another page, a section above can still be loading and push this one down
    // during the trip. If it moved, finish the last few pixels.
    onComplete: () => {
      if (missedBy() > 2 && !atPageEnd()) smooth.scrollTo(element, { duration: 0.6, easing: easeOutQuart })
    },
  })
}

// New pages open at the top straight away: only section links scroll.
export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo({ top: 0, behavior: 'instant' })
}

// ScrollTrigger measures where things are when it starts. Products and photos that load later
// change the page's height, so it measures again once the page settles.
export function watchPageHeight() {
  let refresh: gsap.core.Tween | null = null

  const observer = new ResizeObserver(() => {
    refresh?.kill()
    refresh = gsap.delayedCall(0.2, () => ScrollTrigger.refresh())
  })
  observer.observe(document.body)

  return () => {
    observer.disconnect()
    refresh?.kill()
  }
}
