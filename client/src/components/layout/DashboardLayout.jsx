import { useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Store, UserRound, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { ROLES } from '../../utils/constants'
import MobileNav from './MobileNav'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const NAV_BY_ROLE = {
  [ROLES.ADMIN]: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/stores', label: 'Stores', icon: Store },
    { to: '/admin/profile', label: 'Profile', icon: UserRound },
  ],
  [ROLES.NORMAL_USER]: [
    { to: '/app', label: 'Stores', icon: Store, end: true },
    { to: '/app/profile', label: 'Profile', icon: UserRound },
  ],
  [ROLES.STORE_OWNER]: [
    { to: '/owner', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/owner/profile', label: 'Profile', icon: UserRound },
  ],
}

const TITLE_BY_PATH = {
  '/admin': 'Overview',
  '/admin/users': 'Users',
  '/admin/users/new': 'Add user',
  '/admin/stores': 'Stores',
  '/admin/stores/new': 'Add store',
  '/admin/profile': 'Profile',
  '/app': 'Stores',
  '/app/profile': 'Profile',
  '/owner': 'Dashboard',
  '/owner/profile': 'Profile',
}

function getTitle(pathname) {
  if (TITLE_BY_PATH[pathname]) return TITLE_BY_PATH[pathname]
  if (pathname.startsWith('/admin/users/')) return 'User details'
  return 'RATEORA'
}

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const items = useMemo(() => NAV_BY_ROLE[user?.role] || [], [user?.role])

  const handleLogout = async () => {
    await logout()
    toast.success('You have been signed out')
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-svh bg-canvas">
      <div className="hidden lg:block">
        <div className="sticky top-0 h-svh">
          <Sidebar items={items} />
        </div>
      </div>

      <MobileNav open={mobileOpen} items={items} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={user}
          title={getTitle(pathname)}
          onMenuClick={() => setMobileOpen(true)}
          onLogout={handleLogout}
        />
        <main className="flex-1 px-4 py-6 md:px-6">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
