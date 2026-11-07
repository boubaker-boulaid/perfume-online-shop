// The one place that decides how money looks, in French format: 89,00 $. The design uses dollars.
export function formatPrice(value: string | number): string {
  return `${Number(value).toFixed(2).replace('.', ',')}\u00a0$`
}
