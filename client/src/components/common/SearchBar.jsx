import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search', className = '' }) {
  return (
    <label className={`relative block ${className}`}>
      <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-line bg-canvas pr-3 pl-9 text-sm text-ink placeholder:text-muted/70 transition-colors hover:border-muted/40 focus-ring"
      />
    </label>
  )
}
