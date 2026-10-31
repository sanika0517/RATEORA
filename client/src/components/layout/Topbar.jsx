import { LogOut, Menu } from 'lucide-react'
import Badge from '../common/Badge'
import { getInitials } from '../../utils/formatters'

export default function Topbar({ user, title, onMenuClick, onLogout }) {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-line bg-canvas/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-ink lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
        <div>
          <p className="text-sm font-medium text-ink">{title}</p>
          <p className="hidden text-xs text-muted sm:block">Store intelligence, kept quiet and precise.</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card text-xs font-medium">
              {getInitials(user.name)}
            </div>
            <div className="leading-tight">
              <p className="max-w-[180px] truncate text-sm text-ink">{user.name}</p>
              <Badge role={user.role} />
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-muted transition-colors hover:border-muted/40 hover:text-ink"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  )
}
