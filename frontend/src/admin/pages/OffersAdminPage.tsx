import { Link } from 'react-router'
import { Pagination } from '../../components/Pagination'
import { useApi } from '../../hooks/useApi'
import { useFilters } from '../../hooks/useFilters'
import type { Offer } from '../../types'
import { formatPrice } from '../../utils/format'
import { getAdminOffers } from '../adminApi'

// "2026-11-15T…" → "15 nov. 2026", short enough to stay on one line
const shortDate = (iso: string) => new Intl.DateTimeFormat('fr-MA', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))

// Whether customers can see the offer right now, and if not, why
function offerState(offer: Offer): { label: string; live: boolean } {
  const now = Date.now()

  if (!offer.is_active) return { label: 'Désactivée', live: false }
  if (new Date(offer.starts_at).getTime() > now) return { label: 'À venir', live: false }
  if (new Date(offer.ends_at).getTime() < now) return { label: 'Terminée', live: false }

  return { label: 'En cours', live: true }
}

// Every offer, including ended, future and switched-off ones
export function OffersAdminPage() {
  const { params, update } = useFilters()
  const page = Number(params.get('page')) || 1
  const { data: result, error, loading } = useApi(() => getAdminOffers(page), String(page))

  return (
    <>
      <div className="admin-heading admin-heading--split">
        <h1 className="admin-title">Offres</h1>
        <Link to="/admin/offers/new" className="button button--accent button--small">
          Nouvelle offre
        </Link>
      </div>

      {loading && <p className="admin-loading">Chargement…</p>}
      {error !== undefined && !loading && <p className="form-error">Impossible de charger les offres.</p>}
      {!loading && result?.data.length === 0 && <p className="admin-muted">Aucune offre pour le moment.</p>}

      {!loading && result && result.data.length > 0 && (
        <div className="panel admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <span className="sr-only">Image</span>
                </th>
                <th>Offre</th>
                <th className="is-number">Prix</th>
                <th>Dates</th>
                <th>État</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((offer) => {
                const state = offerState(offer)

                return (
                  <tr key={offer.id}>
                    <td className="admin-table__thumb">
                      <img src={offer.image_path} alt="" width={48} height={48} loading="lazy" />
                    </td>
                    <td>
                      <Link to={`/admin/offers/${offer.slug}`}>{offer.title}</Link>
                      <small>
                        {offer.products.length} parfum{offer.products.length > 1 ? 's' : ''}
                        {offer.free_product && ' + 1 offert'} · coffret « {offer.set.name} » ({offer.set.stock} en stock)
                      </small>
                    </td>
                    <td className="is-number">
                      {formatPrice(offer.set.price)}
                      <small>
                        au lieu de {formatPrice(offer.regular_price)} (−{offer.discount_percent} %)
                      </small>
                    </td>
                    <td className="admin-nowrap">
                      {shortDate(offer.starts_at)}
                      <small>au {shortDate(offer.ends_at)}</small>
                    </td>
                    <td>
                      <span className={`admin-status${state.live ? ' admin-status--delivered' : ''}`}>{state.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {result && !loading && <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} onChange={(next) => update({ page: next > 1 ? String(next) : '' })} />}
    </>
  )
}
