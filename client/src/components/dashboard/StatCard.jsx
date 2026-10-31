export default function StatCard({ label, value, hint, accent = 'accent' }) {
  const accents = {
    accent: 'bg-accent',
    cyan: 'bg-cyan',
    warm: 'bg-warm',
    lavender: 'bg-lavender',
  }

  return (
    <article className="rounded-2xl border border-line bg-card p-5 shadow-soft">
      <div className={`mb-4 h-1 w-8 rounded-full ${accents[accent] || accents.accent}`} />
      <p className="text-xs tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-ink">{value}</p>
      {hint && <div className="mt-2 text-sm text-muted">{hint}</div>}
    </article>
  )
}
