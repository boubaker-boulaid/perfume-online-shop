import { Link } from 'react-router'
import { useApi } from '../../hooks/useApi'
import { formatPrice } from '../../utils/format'
import { getStats } from '../adminApi'
import { STATUS_LABELS } from '../labels'
import type { OrderStatus } from '../types'
import { PageTitle } from '../../components/PageTitle'

// "2026-11-05" → "5 nov."
const shortDate = (date: string) => new Intl.DateTimeFormat('fr-MA', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`))

const UNAVAILABLE = 'Indisponible pour le moment.'

export function DashboardPage() {
  const { data: stats, error, loading } = useApi(getStats, 'stats')

  if (loading) return <p className="admin-loading">Chargement…</p>
  if (error || !stats) return <p className="form-error">Impossible de charger les statistiques.</p>

  // Each part can be null on its own (API.md), so each section checks its own part.
  const days = stats.revenue_last_30_days ?? []
  const highest = Math.max(0, ...days.map((day) => day.revenue))
  const scale = Math.max(1, highest) // 1, so an empty month doesn't divide by 0

  return (
    <>
      <PageTitle admin>Tableau de bord</PageTitle>
      <h1 className="admin-title">Tableau de bord</h1>

      <div className="admin-cards">
        <div className="admin-card admin-card--wide">
          <span>Chiffre du mois</span>
          <strong>{stats.revenue_this_month === null ? '—' : formatPrice(stats.revenue_this_month)}</strong>
          <small>Commandes livrées, donc payées</small>
        </div>
        {stats.orders_by_status &&
          (Object.keys(stats.orders_by_status) as OrderStatus[]).map((status) => (
            <Link key={status} to={`/admin/orders?status=${status}`} className="admin-card">
              <span>{STATUS_LABELS[status]}</span>
              <strong>{stats.orders_by_status?.[status]}</strong>
            </Link>
          ))}
      </div>

      <section className="panel">
        <h2>Ventes des 30 derniers jours</h2>
        {stats.revenue_last_30_days === null && <p className="admin-muted">{UNAVAILABLE}</p>}
        {days.length > 0 && (
          <>
            <div className="admin-bars" role="img" aria-label={`Ventes par jour, du ${shortDate(days[0].date)} au ${shortDate(days[days.length - 1].date)}`}>
              {days.map((day) => (
                <span key={day.date} style={{ height: `${(day.revenue / scale) * 100}%` }} title={`${shortDate(day.date)} : ${formatPrice(day.revenue)}`} />
              ))}
            </div>
            <div className="admin-bars__axis">
              <span>{shortDate(days[0].date)}</span>
              <span>Meilleur jour : {formatPrice(highest)}</span>
              <span>{shortDate(days[days.length - 1].date)}</span>
            </div>
          </>
        )}
      </section>

      <div className="admin-columns">
        <section className="panel">
          <h2>Meilleures ventes</h2>
          {stats.top_products === null && <p className="admin-muted">{UNAVAILABLE}</p>}
          {stats.top_products?.length === 0 && <p className="admin-muted">Aucune vente pour le moment.</p>}
          {stats.top_products && stats.top_products.length > 0 && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Parfum</th>
                    <th className="is-number">Vendus</th>
                    <th className="is-number">Chiffre</th>
                    <th className="is-number">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.top_products.map((product) => (
                    <tr key={product.product_id}>
                      <td>
                        <Link to={`/admin/products/${product.slug}`}>{product.name}</Link>
                      </td>
                      <td className="is-number">{product.sold}</td>
                      <td className="is-number">{formatPrice(product.revenue)}</td>
                      <td className="is-number">{product.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <h2>Stock faible</h2>
          {stats.low_stock === null && <p className="admin-muted">{UNAVAILABLE}</p>}
          {stats.low_stock?.length === 0 && <p className="admin-muted">Aucun produit sous 5 unités.</p>}
          {stats.low_stock && stats.low_stock.length > 0 && (
            <ul className="admin-list">
              {stats.low_stock.map((product) => (
                <li key={product.id}>
                  <Link to={`/admin/products/${product.slug}`}>{product.name}</Link>
                  {!product.is_active && <small> (masqué)</small>}
                  <strong className="admin-low">{product.stock}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
