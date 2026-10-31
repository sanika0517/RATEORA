import { useState } from 'react'
import { Star } from 'lucide-react'

export default function RatingStars({
  value = 0,
  onChange,
  readOnly = false,
  size = 18,
  disabled = false,
}) {
  const rating = Number(value) || 0
  const [hovered, setHovered] = useState(0)
  const shown = hovered || rating

  return (
    <div
      className="inline-flex items-center gap-1"
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label="Rating"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((score) => {
        const active = score <= shown

        if (readOnly) {
          return (
            <Star
              key={score}
              size={size}
              className={active ? 'fill-warm text-warm' : 'text-line'}
            />
          )
        }

        return (
          <button
            key={score}
            type="button"
            disabled={disabled}
            aria-label={`${score} star${score > 1 ? 's' : ''}`}
            onMouseEnter={() => setHovered(score)}
            onFocus={() => setHovered(score)}
            onBlur={() => setHovered(0)}
            onClick={() => onChange?.(score)}
            className="rounded-sm transition-transform hover:scale-110 focus-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Star size={size} className={active ? 'fill-warm text-warm' : 'text-muted'} />
          </button>
        )
      })}
    </div>
  )
}
