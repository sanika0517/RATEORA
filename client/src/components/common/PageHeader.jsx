export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs tracking-[0.2em] text-muted uppercase">{eyebrow}</p>
        )}
        <h1 className={`text-2xl font-semibold tracking-tight text-ink ${eyebrow ? 'mt-2' : ''}`}>
          {title}
        </h1>
        {description && <p className="mt-2 text-sm leading-6 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
