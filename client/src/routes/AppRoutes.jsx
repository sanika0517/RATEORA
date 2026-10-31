import { Navigate, Route, Routes } from 'react-router-dom'
import LoadingSpinner from '../components/common/LoadingSpinner'
import AuthLayout from '../components/layout/AuthLayout'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useAuth } from '../hooks/useAuth'
import AddStorePage from '../pages/admin/AddStorePage'
import AddUserPage from '../pages/admin/AddUserPage'
import AdminDashboard from '../pages/admin/AdminDashboard'
import StoresPage from '../pages/admin/StoresPage'
import UserDetailsPage from '../pages/admin/UserDetailsPage'
import UsersPage from '../pages/admin/UsersPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import OwnerDashboardPage from '../pages/owner/OwnerDashboardPage'
import ProfilePage from '../pages/shared/ProfilePage'
import StoreDiscoveryPage from '../pages/user/StoreDiscoveryPage'
import { ROLE_HOME, ROLES } from '../utils/constants'
import GuestRoute from './GuestRoute'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'

function HomeRedirect() {
  const { isAuthenticated, isReady, user } = useAuth()

  if (!isReady) {
    return <LoadingSpinner label="Restoring session" />
  }

  if (isAuthenticated) {
    return <Navigate to={ROLE_HOME[user.role]} replace />
  }

  return <Navigate to="/login" replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route
        element={
          <GuestRoute>
            <AuthLayout />
          </GuestRoute>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <RoleRoute roles={ROLES.ADMIN}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/users/new" element={<AddUserPage />} />
        <Route path="/admin/users/:userId" element={<UserDetailsPage />} />
        <Route path="/admin/stores" element={<StoresPage />} />
        <Route path="/admin/stores/new" element={<AddStorePage />} />
        <Route path="/admin/profile" element={<ProfilePage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <RoleRoute roles={ROLES.NORMAL_USER}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/app" element={<StoreDiscoveryPage />} />
        <Route path="/app/profile" element={<ProfilePage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <RoleRoute roles={ROLES.STORE_OWNER}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/owner" element={<OwnerDashboardPage />} />
        <Route path="/owner/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
