import { AboutSection } from '../components/home/AboutSection'
import { BestSellers } from '../components/home/BestSellers'
import { CollectionCarousel } from '../components/home/CollectionCarousel'
import { ContactSection } from '../components/home/ContactSection'
import { DiscoverBanner } from '../components/home/DiscoverBanner'
import { FeatureBar } from '../components/home/FeatureBar'
import { Hero } from '../components/home/Hero'

export function HomePage() {
  return (
    <>
      <Hero />
      <CollectionCarousel />
      <FeatureBar />
      <BestSellers />
      <DiscoverBanner />
      <AboutSection />
      <ContactSection />
    </>
  )
}
