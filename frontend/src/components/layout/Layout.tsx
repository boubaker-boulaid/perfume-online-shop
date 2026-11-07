import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Footer } from './Footer'
import { Header } from './Header'
import { Newsletter } from '../Newsletter'

// New pages open at the top, and links like /#about scroll to their section.
function useScrollOnNavigate() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' }) // a new page shouldn't scroll, only section links
    }
  }, [pathname, hash, key]) // key: clicking the same link again still scrolls
}

export function Layout() {
  useScrollOnNavigate()
  const { pathname } = useLocation()

  return (
    <div className="app" id="top">
      <Header />
      {/* Only opacity here: a transform would stop the phone buy bar staying fixed */}
      <main key={pathname} className="page-fade">
        <Outlet />
      </main>
      <Newsletter />
      <Footer />
    </div>
  )
}
