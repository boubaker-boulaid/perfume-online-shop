import { useEffect } from 'react'
import { AboutSection } from '../components/home/AboutSection'
import { CollectionsSection } from '../components/home/CollectionsSection'
import { ContactSection } from '../components/home/ContactSection'
import { EditorialCards } from '../components/home/EditorialCards'
import { FragranceCarousel } from '../components/home/FragranceCarousel'
import { Hero } from '../components/home/Hero'

const ANNOUNCEMENT_GOLD = '#cdaa76'

// Phones color their toolbar with the site's navy. Here it would sit right above the gold
// announcement line, so it takes that gold while this page is open.
function useGoldToolbar() {
  useEffect(() => {
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (!themeColor) return

    const siteColor = themeColor.content
    themeColor.content = ANNOUNCEMENT_GOLD

    return () => {
      themeColor.content = siteColor
    }
  }, [])
}

export function HomePage() {
  useGoldToolbar()

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
