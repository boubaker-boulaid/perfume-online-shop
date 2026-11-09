import { useSearchParams } from 'react-router'
import { SearchIcon } from '../components/Icons'
import { PageHeading } from '../components/PageHeading'
import { Pagination } from '../components/Pagination'
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard'
import { useApi } from '../hooks/useApi'
import { getCategories, getProducts } from '../services/api'
import type { ProductFilters, ProductSort } from '../types'

const sortOptions: { value: ProductSort | ''; label: string }[] = [
  { value: '', label: 'Recommandés' },
  { value: 'newest', label: 'Nouveautés' },
  { value: 'oldest', label: 'Plus anciens' },
  { value: 'price_asc', label: 'Prix : du moins cher au plus cher' },
  { value: 'price_desc', label: 'Prix : du plus cher au moins cher' },
]

export function ShopPage() {
  // The filters live in the url with the API's own parameter names, so a filtered
  // page can be shared and the back button works.
  const [params, setParams] = useSearchParams()

  const filters: ProductFilters = {
    q: params.get('q') ?? undefined,
    category: params.get('category') ?? undefined,
    min_price: params.get('min_price') ?? undefined,
    max_price: params.get('max_price') ?? undefined,
    sort: (params.get('sort') as ProductSort) ?? undefined,
    page: Number(params.get('page')) || 1,
  }

  const { data: categories } = useApi(getCategories, 'categories')
  const { data: result, loading } = useApi(() => getProducts(filters), params.toString())

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params)

    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)))
    if (!('page' in changes)) next.delete('page') // new filters start again from page 1

    setParams(next)
  }

  const goToPage = (page: number) => {
    update({ page: page > 1 ? String(page) : '' })
    window.scrollTo(0, 0)
  }

  const hasFilters = ['q', 'category', 'min_price', 'max_price'].some((key) => params.get(key))
  const hasPriceFilter = Boolean(params.get('min_price') || params.get('max_price'))

  return (
    <div className="container page">
      <PageHeading eyebrow="Boutique" title={<>Tous les <em>parfums</em></>} />

      <form
        className="search"
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          update({ q: String(new FormData(event.currentTarget).get('q') ?? '').trim() })
        }}
      >
        <SearchIcon />
        <input key={params.get('q') ?? ''} type="search" name="q" aria-label="Rechercher un parfum" placeholder="Chercher un parfum" defaultValue={params.get('q') ?? ''} maxLength={100} />
        <button type="submit" className="button button--accent button--small">
          Chercher
        </button>
      </form>

      <div className="chips" role="group" aria-label="Catégorie">
        <button type="button" className={`chip${!params.get('category') ? ' is-active' : ''}`} aria-pressed={!params.get('category')} onClick={() => update({ category: '' })}>
          Tous
        </button>
        {categories?.map((category) => (
          <button key={category.id} type="button" className={`chip${params.get('category') === category.slug ? ' is-active' : ''}`} aria-pressed={params.get('category') === category.slug} onClick={() => update({ category: category.slug })}>
            {category.name}
            <span>{category.products_count}</span>
          </button>
        ))}
      </div>

      <div className="shop-tools">
        <details className="price-filter" open={hasPriceFilter || undefined}>
          <summary>Prix</summary>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              update({ min_price: String(data.get('min_price') ?? ''), max_price: String(data.get('max_price') ?? '') })
            }}
          >
            <label className="field">
              <span className="field__label">Min</span>
              <input key={params.get('min_price') ?? ''} type="number" name="min_price" min="0" inputMode="decimal" defaultValue={params.get('min_price') ?? ''} placeholder="0" />
            </label>
            <label className="field">
              <span className="field__label">Max</span>
              <input key={params.get('max_price') ?? ''} type="number" name="max_price" min="0" inputMode="decimal" defaultValue={params.get('max_price') ?? ''} placeholder="200" />
            </label>
            <button type="submit" className="button button--ghost">
              Appliquer
            </button>
          </form>
        </details>

        <label className="sort">
          <span className="sr-only">Trier par</span>
          <select value={params.get('sort') ?? ''} onChange={(event) => update({ sort: event.target.value })}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="shop-count" role="status">
        {result && !loading && `${result.meta.total} ${result.meta.total > 1 ? 'parfums' : 'parfum'}`}
        {hasFilters && (
          <button type="button" className="text-button" onClick={() => setParams({})}>
            Effacer les filtres
          </button>
        )}
      </div>

      <div className="product-grid">
        {loading && Array.from({ length: 6 }, (_, index) => <ProductCardSkeleton key={index} />)}
        {!loading && result?.data.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
      </div>

      {!loading && result?.data.length === 0 && (
        <div className="empty">
          <h2>Aucun parfum trouvé</h2>
          <p>Essayez un autre mot, ou demandez-nous sur WhatsApp.</p>
        </div>
      )}

      {result && !loading && <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} onChange={goToPage} />}
    </div>
  )
}
