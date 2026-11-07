export function Stars({ rating = 0, reviews }: { rating?: number; reviews?: number }) {
  const rounded = Math.round(rating)

  return (
    <div className="stars">
      <span className="stars__icons" role="img" aria-label={`${rounded} étoiles sur 5`}>
        {'★'.repeat(rounded)}
        {'☆'.repeat(5 - rounded)}
      </span>
      {reviews !== undefined && <span className="stars__count">({reviews})</span>}
    </div>
  )
}
