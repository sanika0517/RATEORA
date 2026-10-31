export default function FormTextarea({
  label,
  error,
  hint,
  className = '',
  id,
  rows = 4,
  ...props
}) {
  const inputId = id || props.name

  return (
    <label className={`block ${className}`} htmlFor={inputId}>
      {label && <span className="mb-2 block text-sm font-medium text-ink">{label}</span>}
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full resize-y rounded-lg border bg-canvas px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 transition-colors focus-ring ${
          error ? 'border-danger/50' : 'border-line hover:border-muted/40'
        }`}
        {...props}
      />
      {hint && !error && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs text-danger">{error}</span>}
    </label>
  )
}
