import { PageHeading } from '../components/PageHeading'
import { PillLink } from '../components/PillLink'
import { PageTitle } from '../components/PageTitle'

export function NotFoundPage() {
  return (
    <div className="container page">
      <PageTitle>Page introuvable</PageTitle>
      <PageHeading eyebrow="404" title={<>Page <em>introuvable</em></>} center>
        Cette page ou ce parfum n’existe plus.
      </PageHeading>
      <div className="page-actions">
        <PillLink to="/shop">Voir les parfums</PillLink>
      </div>
    </div>
  )
}
