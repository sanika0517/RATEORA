export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/25 bg-accent/15 text-sm font-semibold text-lavender">
        R
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="text-[13px] font-semibold tracking-[0.18em] text-ink">RATEORA</p>
          <p className="text-[11px] text-muted">Every rating tells a story.</p>
        </div>
      )}
    </div>
  )
}
