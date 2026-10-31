import { Navigate } from 'react-router-dom'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'
import { ROLE_HOME } from '../utils/constants'

export default function GuestRoute({ children }) {
  const { isAuthenticated, isReady, user } = useAuth()

  if (!isReady) {
    return <LoadingSpinner label="Restoring session" />
  }

  if (isAuthenticated) {
    return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />
  }

  return children
}
