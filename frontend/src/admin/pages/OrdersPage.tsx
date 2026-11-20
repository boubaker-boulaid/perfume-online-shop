import { Link } from 'react-router'
import { SearchIcon } from '../../components/Icons'
import { Pagination } from '../../components/Pagination'
import { useApi } from '../../hooks/useApi'
import { useFilters } from '../../hooks/useFilters'
import { formatDate, formatPrice } from '../../utils/format'
import { getOrders } from '../adminApi'
import { ORDER_SORT_LABELS, STATUS_LABELS } from '../labels'
import type { OrderFilters, OrderStatus } from '../types'

export function OrdersPage() {
  // Like the shop: the filters live in the address, and the key of useApi is the address's
  // query, so any change loads again.
  const { params, update, clear } = useFilters()

  const filters: OrderFilters = {
    q: params.get('q') ?? undefined,
    // The address is typed by humans: the backend checks these and answers 422 to a wrong one.
    status: (params.get('status') as OrderStatus | null) ?? undefined,
    sort: (params.get('sort') as OrderFilters['sort'] | null) ?? undefined,
    page: Number(params.get('page')) || 1,
  }

  const { data: result, error, loading } = useApi(() => getOrders(filters), params.toString())
  const hasFilters = ['q', 'status'].some((key) => params.get(key))

  return (
    <>
      <h1 className="admin-title">Commandes</h1>

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
          <input key={params.get('q') ?? ''} type="search" name="q" aria-label="Rechercher une commande" placeholder="N°, nom ou téléphone" defaultValue={params.get('q') ?? ''} maxLength={100} />
          <button type="submit" className="button button--accent button--small">
            Chercher
          </button>
        </form>

        <label className="admin-select">
          <span className="sr-only">Statut</span>
          <select value={params.get('status') ?? ''} onChange={(event) => update({ status: event.target.value })}>
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-select">
          <span className="sr-only">Trier par</span>
          <select value={params.get('sort') ?? ''} onChange={(event) => update({ sort: event.target.value })}>
            <option value="">Plus récentes</option>
            {Object.entries(ORDER_SORT_LABELS)
              .filter(([value]) => value !== 'newest') // the default, already the first option
              .map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
          </select>
        </label>
      </div>

      <div className="admin-count" role="status">
        {result && !loading && `${result.meta.total} ${result.meta.total > 1 ? 'commandes' : 'commande'}`}
        {hasFilters && (
          <button type="button" className="text-button" onClick={clear}>
            Effacer les filtres
          </button>
        )}
      </div>

      {loading && <p className="admin-loading">Chargement…</p>}
      {error !== undefined && !loading && <p className="form-error">Impossible de charger les commandes. Vérifiez les filtres, ou réessayez.</p>}
      {!loading && result?.data.length === 0 && <p className="admin-muted">Aucune commande trouvée.</p>}

      {!loading && result && result.data.length > 0 && (
        <div className="panel admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Client</th>
                <th className="is-number">Total</th>
                <th>Statut</th>
                <th>WhatsApp</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link to={`/admin/orders/${order.order_number}`}>{order.order_number}</Link>
                  </td>
                  <td>
                    {order.customer_name}
                    <small>
                      {order.city} · {order.phone}
                    </small>
                  </td>
                  <td className="is-number">{formatPrice(order.total)}</td>
                  <td>
                    <span className={`admin-status admin-status--${order.status}`}>{STATUS_LABELS[order.status]}</span>
                  </td>
                  <td>{order.whatsapp_opened_at ? 'Oui' : 'Non'}</td>
                  <td>{formatDate(order.created_at)}</td>
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
