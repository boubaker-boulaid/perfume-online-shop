import { Link } from 'react-router'
import { SearchIcon } from '../../components/Icons'
import { Pagination } from '../../components/Pagination'
import { useApi } from '../../hooks/useApi'
import { useFilters } from '../../hooks/useFilters'
import type { ProductFilters, ProductSort } from '../../types'
import { formatPrice } from '../../utils/format'
import { getAdminProducts, getAllAdminCategories } from '../adminApi'
import { PageTitle } from '../../components/PageTitle'

const SORT_LABELS: Record<ProductSort, string> = {
  newest: 'Plus récents',
  oldest: 'Plus anciens',
  price_asc: 'Prix croissant',
  price_desc: 'Prix décroissant',
}

const LOW_STOCK = 5

// Every product, hidden ones and the offers' sets included. Like OrdersPage, the filters live
// in the address.
export function ProductsPage() {
  const { params, update, clear } = useFilters()

  const filters: ProductFilters = {
    q: params.get('q') ?? undefined,
    category: params.get('category') ?? undefined,
    sort: (params.get('sort') as ProductSort | null) ?? undefined,
    page: Number(params.get('page')) || 1,
  }

  const { data: categories } = useApi(getAllAdminCategories, 'all-categories')
  const { data: result, error, loading } = useApi(() => getAdminProducts(filters), params.toString())
  const hasFilters = ['q', 'category'].some((key) => params.get(key))

  return (
    <>
      <PageTitle admin>Produits</PageTitle>
      <div className="admin-heading admin-heading--split">
        <h1 className="admin-title">Produits</h1>
        <Link to="/admin/products/new" className="button button--accent button--small">
          Nouveau produit
        </Link>
      </div>

      <div className="admin-toolbar">
        <form
          className="admin-search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            update({ q: String(new FormData(event.currentTarget).get('q') ?? '').trim() })
          }}
        >
          <SearchIcon />
          <input key={params.get('q') ?? ''} type="search" name="q" aria-label="Rechercher un produit" placeholder="Nom du parfum" defaultValue={params.get('q') ?? ''} maxLength={100} />
          <button type="submit" className="button button--accent button--small">
            Chercher
          </button>
        </form>

        <label className="admin-select">
          <span className="sr-only">Catégorie</span>
          <select value={params.get('category') ?? ''} onChange={(event) => update({ category: event.target.value })}>
            <option value="">Toutes les catégories</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-select">
          <span className="sr-only">Trier par</span>
          <select value={params.get('sort') ?? ''} onChange={(event) => update({ sort: event.target.value })}>
            <option value="">Ordre de la boutique</option>
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-count" role="status">
        {result && !loading && `${result.meta.total} ${result.meta.total > 1 ? 'produits' : 'produit'}`}
        {hasFilters && (
          <button type="button" className="text-button" onClick={clear}>
            Effacer les filtres
          </button>
        )}
      </div>

      {loading && <p className="admin-loading">Chargement…</p>}
      {error !== undefined && !loading && <p className="form-error">Impossible de charger les produits. Vérifiez les filtres, ou réessayez.</p>}
      {!loading && result?.data.length === 0 && <p className="admin-muted">Aucun produit trouvé.</p>}

      {!loading && result && result.data.length > 0 && (
        <div className="panel admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <span className="sr-only">Image</span>
                </th>
                <th>Nom</th>
                <th>Catégorie</th>
                <th className="is-number">Prix</th>
                <th className="is-number">Stock</th>
                <th>Visible</th>
                <th>Accueil</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((product) => (
                <tr key={product.id}>
                  <td className="admin-table__thumb">
                    <img src={product.image_path} alt="" width={48} height={48} loading="lazy" />
                  </td>
                  <td>
                    <Link to={`/admin/products/${product.slug}`}>{product.name}</Link>
                    {product.is_offer && <span className="admin-tag">Coffret</span>}
                  </td>
                  <td>{product.category.name}</td>
                  <td className="is-number">
                    {formatPrice(product.price)}
                    {product.compare_at_price && <small>au lieu de {formatPrice(product.compare_at_price)}</small>}
                  </td>
                  <td className={`is-number${product.stock < LOW_STOCK ? ' admin-low' : ''}`}>{product.stock}</td>
                  <td>{product.is_active ? 'Oui' : 'Non'}</td>
                  <td>{product.is_featured ? 'Oui' : 'Non'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result && !loading && <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} onChange={(page) => update({ page: page > 1 ? String(page) : '' })} />}
    </>
  )
}
