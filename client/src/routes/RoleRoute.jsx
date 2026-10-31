import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROLE_HOME } from '../utils/constants'

export default function RoleRoute({ roles, children }) {
  const { user } = useAuth()
  const allowed = Array.isArray(roles) ? roles : [roles]

  if (!user || !allowed.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user?.role] || '/login'} replace />
  }

  return children
}
