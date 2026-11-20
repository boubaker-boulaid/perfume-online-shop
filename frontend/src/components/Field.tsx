import type { ReactNode } from 'react'

type Props = {
  label: string
  name: string
  error?: string[]
  children: ReactNode // the input, select or textarea between <Field> and </Field>
}

// A label, its input, and the first error the backend sent for it.
export function Field({ label, name, error, children }: Props) {
  return (
    <label className={`field${error ? ' has-error' : ''}`} htmlFor={name}>
      <span className="field__label">{label}</span>
      {children}
      {error && <span className="field__error">{error[0]}</span>}
    </label>
  )
}
