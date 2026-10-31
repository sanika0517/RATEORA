export default function FormSelect({
  label,
  error,
  hint,
  className = '',
  id,
  children,
  placeholder,
  ...props
}) {
  const inputId = id || props.name

  return (
    <label className={`block ${className}`} htmlFor={inputId}>
      {label && <span className="mb-2 block text-sm font-medium text-ink">{label}</span>}
      <select
        id={inputId}
        className={`h-11 w-full rounded-lg border bg-canvas px-3 text-sm text-ink transition-colors focus-ring ${
          error ? 'border-danger/50' : 'border-line hover:border-muted/40'
        }`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      {hint && !error && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs text-danger">{error}</span>}
    </label>
  )
}
