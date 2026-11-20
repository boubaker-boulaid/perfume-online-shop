// When a page's data couldn't load for another reason than "it doesn't exist": no network, or
// the server is asleep or down. Unlike "not found", trying again can work.
export function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="empty" role="alert">
      <h2>Chargement impossible</h2>
      <p>La boutique ne répond pas pour le moment. Vérifiez votre connexion, puis réessayez.</p>
      <button type="button" className="button button--accent" onClick={onRetry}>
        Réessayer
      </button>
    </div>
  )
}
