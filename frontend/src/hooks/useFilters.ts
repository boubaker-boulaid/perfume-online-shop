import { useSearchParams } from 'react-router'

// Filters that live in the url, with the API's own parameter names, so a filtered page can be
// shared and the back button works. Used by the shop and by the admin's lists.
export function useFilters() {
  const [params, setParams] = useSearchParams()

  // An empty value removes the filter. Any change but the page starts again from page 1.
  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params)

    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)))
    if (!('page' in changes)) next.delete('page') // new filters start again from page 1

    setParams(next)
  }

  const clear = () => setParams({})

  return { params, update, clear }
}
