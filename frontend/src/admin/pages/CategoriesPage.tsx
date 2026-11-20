import { Link } from 'react-router'
import { useApi } from '../../hooks/useApi'
import { getAllAdminCategories } from '../adminApi'

// Every category, hidden ones included, in the shop's order
export function CategoriesPage() {
  const { data: categories, error, loading } = useApi(getAllAdminCategories, 'all-categories')

  return (
    <>
      <div className="admin-heading admin-heading--split">
        <h1 className="admin-title">Catégories</h1>
        <Link to="/admin/categories/new" className="button button--accent button--small">
          Nouvelle catégorie
        </Link>
      </div>

      {loading && <p className="admin-loading">Chargement…</p>}
      {error !== undefined && <p className="form-error">Impossible de charger les catégories.</p>}
      {categories?.length === 0 && <p className="admin-muted">Aucune catégorie pour le moment.</p>}

      {categories && categories.length > 0 && (
        <div className="panel admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th className="is-number">Produits</th>
                <th>Visible</th>
                <th className="is-number">Ordre</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <Link to={`/admin/categories/${category.slug}`}>{category.name}</Link>
                    {category.description && <small>{category.description}</small>}
                  </td>
                  <td className="is-number">
                    <Link to={`/admin/products?category=${category.slug}`}>{category.products_count ?? 0}</Link>
                  </td>
                  <td>{category.is_active ? 'Oui' : 'Non'}</td>
                  <td className="is-number">{category.sort_order}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
