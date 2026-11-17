import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

// Scroll animations only run for visitors who haven't asked their device for reduced motion.
// Everyone else sees every section as it is, with nothing moving.
export const MOTION_OK = '(prefers-reduced-motion: no-preference)'

export const prefersReducedMotion = () => !window.matchMedia(MOTION_OK).matches

export { gsap, ScrollTrigger, SplitText }
