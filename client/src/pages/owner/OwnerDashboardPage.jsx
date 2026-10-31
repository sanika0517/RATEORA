import { useEffect, useState } from 'react'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/dashboard/StatCard'
import RatingStars from '../../components/ratings/RatingStars'
import DataTable from '../../components/tables/DataTable'
import { getOwnerDashboard } from '../../services/owner.service'
import { formatDateTime, formatRating, getApiError } from '../../utils/formatters'

export default function OwnerDashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    setStatus(null)

    try {
      const response = await getOwnerDashboard()
      setData(response.data)
    } catch (err) {
      setStatus(err.response?.status || null)
      setError(getApiError(err, 'Unable to load store performance'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <LoadingSpinner label="Loading store" />

  if (status === 404) {
    return (
      <EmptyState
        title="No store assigned"
        description="This account does not have a store yet. An admin can create one and assign it to you."
      />
    )
  }

  if (error) return <ErrorState description={error} onRetry={load} />
  if (!data) return null

  return (
    <section className="space-y-8">
      <PageHeader
        title={data.store.name}
        description={`${data.store.email} · ${data.store.address}`}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Average rating"
          value={formatRating(data.averageRating)}
          hint={<RatingStars value={data.averageRating} readOnly />}
        />
        <StatCard label="Total ratings" value={data.totalRatings} accent="cyan" />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-ink">Customers who rated this store</h2>
        <DataTable
          columns={[
            { key: 'name', header: 'Customer', render: (row) => row.user?.name },
            { key: 'email', header: 'Email', render: (row) => row.user?.email },
            {
              key: 'rating',
              header: 'Rating',
              render: (row) => (
                <span className="inline-flex items-center gap-2">
                  <RatingStars value={row.rating} readOnly size={14} />
                  {row.rating}
                </span>
              ),
            },
            {
              key: 'createdAt',
              header: 'Submitted',
              render: (row) => formatDateTime(row.createdAt),
            },
          ]}
          rows={data.ratings}
          empty={
            <EmptyState
              title="No ratings yet"
              description="When members rate this store, they will appear here."
            />
          }
        />
      </div>
    </section>
  )
}
