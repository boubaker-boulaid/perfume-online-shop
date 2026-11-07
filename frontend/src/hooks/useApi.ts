import { useEffect, useEffectEvent, useState } from 'react'

type State<T> = { key: string; data?: T; error?: unknown }

// Loads data when the page opens, and again whenever `key` changes.
export function useApi<T>(load: () => Promise<T>, key: string) {
  const [state, setState] = useState<State<T> | null>(null)
  const runLoad = useEffectEvent(load)

  useEffect(() => {
    let active = true

    runLoad().then(
      (data) => active && setState({ key, data }),
      (error: unknown) => active && setState({ key, error }),
    )

    return () => {
      active = false
    }
  }, [key])

  const current = state?.key === key ? state : null

  return { data: current?.data, error: current?.error, loading: current === null }
}
