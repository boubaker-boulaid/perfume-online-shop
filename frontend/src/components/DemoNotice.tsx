import { DEMO_MODE } from '../utils/demo'

// Tells every visitor of the public demo that nothing here is a real sale.
export function DemoNotice() {
  if (!DEMO_MODE) return null

  return (
    <p className="demo-notice" role="note">
      Site de démonstration (projet portfolio) : prix fictifs, aucune commande n’est réelle.
    </p>
  )
}
