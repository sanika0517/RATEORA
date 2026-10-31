import { Navigate, useLocation } from 'react-router-dom'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isReady } = useAuth()
  const location = useLocation()

  if (!isReady) {
    return <LoadingSpinner label="Restoring session" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
