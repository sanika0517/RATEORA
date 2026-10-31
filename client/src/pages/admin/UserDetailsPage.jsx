import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PageHeader from '../../components/common/PageHeader'
import RatingStars from '../../components/ratings/RatingStars'
import AdminUserActions from '../../components/admin/AdminUserActions'
import { useAuth } from '../../hooks/useAuth'
import { getAdminUser } from '../../services/admin.service'
import { ROLES } from '../../utils/constants'
import { formatDate, formatRating, getApiError } from '../../utils/formatters'

export default function UserDetailsPage() {
  const { userId } = useParams()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getAdminUser(userId)
      setUser(response.data)
    } catch (err) {
      setError(getApiError(err, 'Unable to load this user'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  if (loading) return <LoadingSpinner label="Loading user" />
  if (error) return <ErrorState description={error} onRetry={load} />
  if (!user) return null

  return (
    <section className="space-y-8">
      <PageHeader
        title={user.name}
        description="Complete account record from the admin directory."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AdminUserActions
              user={user}
              currentUserId={currentUser?.id}
              onUpdated={load}
              onDeleted={() => navigate('/admin/users', { replace: true })}
            />
            <Button as={Link} to="/admin/users" variant="secondary">
              Back to users
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-line bg-card p-6">
          <p className="text-sm font-medium text-ink">Account</p>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="mt-1 text-ink">{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted">Role</dt>
              <dd className="mt-2">
                <Badge role={user.role} />
              </dd>
            </div>
            <div>
              <dt className="text-muted">Address</dt>
              <dd className="mt-1 leading-6 text-ink">{user.address}</dd>
            </div>
            <div>
              <dt className="text-muted">Joined</dt>
              <dd className="mt-1 text-ink">{formatDate(user.createdAt)}</dd>
            </div>
          </dl>
        </article>

        {user.role === ROLES.STORE_OWNER && (
          <article className="rounded-2xl border border-line bg-card p-6">
            <p className="text-sm font-medium text-ink">Owned store</p>
            {user.storeDetails ? (
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-muted">Name</dt>
                  <dd className="mt-1 text-ink">{user.storeDetails.name}</dd>
                </div>
                <div>
                  <dt className="text-muted">Email</dt>
                  <dd className="mt-1 text-ink">{user.storeDetails.email}</dd>
                </div>
                <div>
                  <dt className="text-muted">Address</dt>
                  <dd className="mt-1 leading-6 text-ink">{user.storeDetails.address}</dd>
                </div>
                <div>
                  <dt className="text-muted">Average rating</dt>
                  <dd className="mt-2 flex items-center gap-3">
                    <RatingStars value={user.storeDetails.averageRating} readOnly />
                    <span className="text-ink">{formatRating(user.storeDetails.averageRating)}</span>
                    <span className="text-muted">{user.storeDetails.totalRatings} ratings</span>
                  </dd>
                </div>
              </dl>
            ) : (
              <EmptyState
                title="No store assigned"
                description="This owner does not have a store yet."
                action={
                  <Button as={Link} to="/admin/stores/new" variant="secondary" size="sm">
                    Add store
                  </Button>
                }
              />
            )}
          </article>
        )}
      </div>
    </section>
  )
}
