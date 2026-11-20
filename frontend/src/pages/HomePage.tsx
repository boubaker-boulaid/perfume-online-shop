import { AboutSection } from '../components/home/AboutSection'
import { CollectionsSection } from '../components/home/CollectionsSection'
import { ContactSection } from '../components/home/ContactSection'
import { EditorialCards } from '../components/home/EditorialCards'
import { FragranceCarousel } from '../components/home/FragranceCarousel'
import { Hero } from '../components/home/Hero'
import { useParallax } from '../motion/useScrollReveal'

export function HomePage() {
  // The hero photo sinks a little slower than the page, and the line drawings drift against it
  useParallax('.hero__image', { from: '0%', to: '14%', start: 'top top' })
  useParallax('main .line-art', { from: '40px', to: '-40px' })

  return (
    <>
      <title>Lumé Parfums · Parfums originaux livrés partout au Maroc</title>
      <Hero />
      <FragranceCarousel />
      <EditorialCards />
      <CollectionsSection />
      <AboutSection />
      <ContactSection />
    </>
  )
}
