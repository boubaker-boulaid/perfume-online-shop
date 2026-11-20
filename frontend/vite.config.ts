import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Puts the site's address in index.html, where the share preview needs full addresses. Without
// VITE_SITE_URL the links stay relative, which still works for the browser itself.
function siteUrl(url: string | undefined): Plugin {
  return {
    name: 'site-url',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', (url ?? '').replace(/\/+$/, '')),
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [react(), siteUrl(env.VITE_SITE_URL)],
  }
})
