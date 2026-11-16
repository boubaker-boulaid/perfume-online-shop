import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Footer } from './Footer'
import { Header } from './Header'
import { HomeFooter } from '../home/HomeFooter'
import { HomeNewsletter } from '../home/HomeNewsletter'
import { Newsletter } from '../Newsletter'

const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
const pageWasRefreshed = navigation?.type === 'reload'

// A refresh starts at the top, so the browser mustn't put back the old position. It can do that
// long after the page loads, so this stays off until the visitor scrolls or changes page. From
// then on it's needed again: the back button should return to where they were.
if (pageWasRefreshed) {
  history.scrollRestoration = 'manual'
  window.addEventListener('scroll', () => (history.scrollRestoration = 'auto'), { once: true })
}

// New pages and refreshes open at the top, and links like /#about scroll to their section.
function useScrollOnNavigate() {
  const { pathname, hash, key } = useLocation()
  const refreshedKey = useRef(pageWasRefreshed ? key : null)

  useEffect(() => {
    const isRefreshedPage = key === refreshedKey.current
    if (!isRefreshedPage) history.scrollRestoration = 'auto'

    if (hash && !isRefreshedPage) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' }) // a new page shouldn't scroll, only section links
    }
  }, [pathname, hash, key]) // key: clicking the same link again still scrolls
}

export function Layout() {
  useScrollOnNavigate()
  const { pathname } = useLocation()
  // The home page has the new design, with its own header, newsletter and footer. The other
  // pages keep theirs. "app--home" switches the colors and fonts for everything inside.
  const isHome = pathname === '/'

  return (
    <div className={`app${isHome ? ' app--home' : ''}`} id="top">
      <Header home={isHome} />
      {/* Only opacity here: a transform would stop the phone buy bar staying fixed */}
      <main key={pathname} className="page-fade">
        <Outlet />
      </main>
      {isHome ? <HomeNewsletter /> : <Newsletter />}
      {isHome ? <HomeFooter /> : <Footer />}
    </div>
  )
}
