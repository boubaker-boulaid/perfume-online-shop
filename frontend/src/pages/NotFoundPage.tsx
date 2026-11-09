import { PageHeading } from '../components/PageHeading'
import { PillLink } from '../components/PillLink'

export function NotFoundPage() {
  return (
    <div className="container page">
      <PageHeading eyebrow="404" title={<>Page <em>introuvable</em></>}>
        Cette page ou ce parfum n’existe plus.
      </PageHeading>
      <PillLink to="/shop">Voir les parfums</PillLink>
    </div>
  )
}
