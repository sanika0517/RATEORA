import { NavLink, useLocation } from 'react-router-dom'
import Logo from '../common/Logo'

function isItemActive(pathname, item) {
  if (item.end) {
    return pathname === item.to
  }

  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

export default function Sidebar({ items, onNavigate }) {
  const { pathname } = useLocation()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-line bg-sidebar">
      <div className="px-5 py-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const Icon = item.icon
          const active = isItemActive(pathname, item)

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? 'bg-accent/15 text-ink'
                  : 'text-muted hover:bg-white/[0.03] hover:text-ink'
              }`}
            >
              <Icon size={16} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
