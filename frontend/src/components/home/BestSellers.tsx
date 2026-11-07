import { Link } from 'react-router'
import { useApi } from '../../hooks/useApi'
import { getFeaturedProducts } from '../../services/api'
import { ArrowRightIcon } from '../Icons'
import { ProductCard, ProductCardSkeleton } from '../ProductCard'
import { Reveal } from '../Reveal'

export function BestSellers() {
  const { data: products, loading } = useApi(getFeaturedProducts, 'featured')

  return (
    <section id="shop" className="container section">
      <Reveal className="section-bar">
        <h2>Découvrez nos meilleures ventes</h2>
        <Link to="/shop" className="view-all">
          Tout voir <ArrowRightIcon size={16} strokeWidth={1.6} />
        </Link>
      </Reveal>
      <div className="best-sellers">
        {loading && Array.from({ length: 5 }, (_, index) => <ProductCardSkeleton key={index} />)}
        {products?.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
      </div>
    </section>
  )
}
