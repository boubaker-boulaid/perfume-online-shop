type Props = {
  value: number
  max: number
  label: string
  onChange: (value: number) => void
}

export function QuantityStepper({ value, max, label, onChange }: Props) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" aria-label="Diminuer la quantité" disabled={value <= 1} onClick={() => onChange(value - 1)}>
        −
      </button>
      <span key={value} aria-live="polite">{value}</span>
      <button type="button" aria-label="Augmenter la quantité" disabled={value >= max} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  )
}
