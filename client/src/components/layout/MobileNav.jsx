import { X } from 'lucide-react'
import Sidebar from './Sidebar'

export default function MobileNav({ open, items, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close navigation" onClick={onClose} />
      <div className="relative h-full w-64">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-md p-1 text-muted hover:text-ink"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        <Sidebar items={items} onNavigate={onClose} />
      </div>
    </div>
  )
}
