import { ArrowLeftIcon, ArrowRightIcon } from './Icons'

type Props = {
  page: number
  lastPage: number
  onChange: (page: number) => void
}

export function Pagination({ page, lastPage, onChange }: Props) {
  if (lastPage <= 1) return null

  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" className="icon-button" aria-label="Page précédente" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ArrowLeftIcon size={16} strokeWidth={1.6} />
      </button>
      <span className="pagination__status">
        Page {page} sur {lastPage}
      </span>
      <button type="button" className="icon-button" aria-label="Page suivante" disabled={page >= lastPage} onClick={() => onChange(page + 1)}>
        <ArrowRightIcon size={16} strokeWidth={1.6} />
      </button>
    </nav>
  )
}
