export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-card/40 px-6 py-16 text-center">
      <h3 className="text-base font-medium text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
