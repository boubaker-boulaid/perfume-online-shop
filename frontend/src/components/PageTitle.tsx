// The page's name in the browser tab, the history and shared links. React 19 moves a <title>
// written anywhere into the page's <head>. It wants one piece of text, hence the template string.
export function PageTitle({ children, admin = false }: { children: string; admin?: boolean }) {
  return <title>{`${children} · ${admin ? 'Admin Lumé' : 'Lumé Parfums'}`}</title>
}
