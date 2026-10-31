export default function FilterDropdown({
  label,
  value,
  onChange,
  options,
  className = '',
}) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-2 block text-xs font-medium text-muted">{label}</span>}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-line bg-canvas px-3 text-sm text-ink transition-colors hover:border-muted/40 focus-ring"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
