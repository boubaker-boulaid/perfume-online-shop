import { PageHeading } from '../components/PageHeading'
import { PillLink } from '../components/PillLink'

export function NotFoundPage() {
  return (
    <div className="container page">
      <PageHeading eyebrow="404" title={<>Page <em>introuvable</em></>}>
        La page ou le parfum que vous recherchez n’existe pas ou n’est plus disponible.
      </PageHeading>
      <PillLink to="/shop">Découvrir la boutique</PillLink>
    </div>
  )
}
