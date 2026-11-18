import { useEffect, useEffectEvent, useState } from 'react'

type State<T> = { key: string; data?: T; error?: unknown }

// Loads data when the page opens, and again whenever `key` changes.
export function useApi<T>(load: () => Promise<T>, key: string) {
  const [state, setState] = useState<State<T> | null>(null)
  const runLoad = useEffectEvent(load)

  useEffect(() => {
    // false once the page has moved on, so an old answer can't replace a newer one
    let active = true

    const fetchData = async () => {
      try {
        const data = await runLoad()
        if (active) setState({ key, data })
      } catch (error) {
        if (active) setState({ key, error })
      }
    }

    void fetchData()

    return () => {
      active = false
    }
  }, [key])

  const current = state?.key === key ? state : null

  return { data: current?.data, error: current?.error, loading: current === null }
}
