import { AboutSection } from '../components/home/AboutSection'
import { CollectionsSection } from '../components/home/CollectionsSection'
import { ContactSection } from '../components/home/ContactSection'
import { EditorialCards } from '../components/home/EditorialCards'
import { FragranceCarousel } from '../components/home/FragranceCarousel'
import { Hero } from '../components/home/Hero'

export function HomePage() {
  return (
    <>
      <Hero />
      <FragranceCarousel />
      <EditorialCards />
      <CollectionsSection />
      <AboutSection />
      <ContactSection />
    </>
  )
}
