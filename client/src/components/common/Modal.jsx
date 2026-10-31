import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, title, children, onClose }) {
  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-line bg-card p-6 shadow-soft"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-lg font-medium text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted transition-colors hover:bg-white/5 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
