// The one place that decides how money looks, in French format: 89,00 $. The design uses dollars.
const DAY = 24 * 60 * 60 * 1000

// Rounded down, so the page never promises more than the real reduction.
export function discountPercent(price: string, compareAtPrice: string): number {
  // in cents, because decimals would turn 22 % into 21,999... and show 21 %
  const cents = Math.round(Number(price) * 100)
  const compareCents = Math.round(Number(compareAtPrice) * 100)

  return Math.floor(((compareCents - cents) * 100) / compareCents)
}

export function formatDiscount(percent: number): string {
  return `Jusqu’à -${percent}\u00a0%`
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))
}

export function formatTimeLeft(endsAt: string): string {
  const days = Math.floor((new Date(endsAt).getTime() - Date.now()) / DAY)

  if (days < 1) return 'Dernier jour'

  return days === 1 ? 'Plus qu’un jour' : `Plus que ${days} jours`
}

export function formatPrice(value: string | number): string {
  return `${Number(value).toFixed(2).replace('.', ',')}\u00a0$`
}
