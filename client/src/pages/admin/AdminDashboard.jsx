import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PageHeader from '../../components/common/PageHeader'
import RoleChart from '../../components/dashboard/RoleChart'
import StatCard from '../../components/dashboard/StatCard'
import DataTable from '../../components/tables/DataTable'
import { getAdminDashboard, getAdminStores, getAdminUsers } from '../../services/admin.service'
import { formatDate, formatRating, getApiError } from '../../utils/formatters'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [recentStores, setRecentStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')

    try {
      const [dashboard, users, stores] = await Promise.all([
        getAdminDashboard(),
        getAdminUsers({ sortBy: 'createdAt', order: 'desc', page: 1, limit: 5 }),
        getAdminStores({ sortBy: 'createdAt', order: 'desc', page: 1, limit: 5 }),
      ])

      setStats(dashboard.data)
      setRecentUsers(users.data.users)
      setRecentStores(stores.data.stores)
    } catch (err) {
      setError(getApiError(err, 'Unable to load dashboard'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <LoadingSpinner label="Loading overview" />
  if (error) return <ErrorState description={error} onRetry={load} />

  return (
    <section className="space-y-8">
      <PageHeader
        title="Overview"
        description="Live platform totals from the RATEORA workspace."
        actions={
          <>
            <Button as={Link} to="/admin/users/new" variant="secondary">
              Add user
            </Button>
            <Button as={Link} to="/admin/stores/new">
              Add store
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={stats.totalUsers} />
        <StatCard label="Stores" value={stats.totalStores} accent="cyan" />
        <StatCard label="Ratings" value={stats.totalRatings} accent="warm" />
        <StatCard
          label="Members"
          value={stats.usersByRole?.NORMAL_USER ?? 0}
          hint="Normal user accounts"
          accent="lavender"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl border border-line bg-card p-5">
          <p className="text-sm font-medium text-ink">Role mix</p>
          <p className="mt-1 text-sm text-muted">Distribution of registered accounts.</p>
          <div className="mt-4">
            <RoleChart usersByRole={stats.usersByRole} />
          </div>
        </article>

        <article className="rounded-2xl border border-line bg-card p-5">
          <p className="text-sm font-medium text-ink">Role counts</p>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">Admins</dt>
              <dd className="text-ink">{stats.usersByRole?.ADMIN ?? 0}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Members</dt>
              <dd className="text-ink">{stats.usersByRole?.NORMAL_USER ?? 0}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Store owners</dt>
              <dd className="text-ink">{stats.usersByRole?.STORE_OWNER ?? 0}</dd>
            </div>
          </dl>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink">Recent users</h2>
            <Link to="/admin/users" className="text-sm text-muted hover:text-ink">
              View all
            </Link>
          </div>
          <DataTable
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'email', header: 'Email' },
              {
                key: 'createdAt',
                header: 'Joined',
                render: (row) => formatDate(row.createdAt),
              },
            ]}
            rows={recentUsers}
            empty={<EmptyState title="No users yet" description="Create the first account to populate this list." />}
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink">Recent stores</h2>
            <Link to="/admin/stores" className="text-sm text-muted hover:text-ink">
              View all
            </Link>
          </div>
          <DataTable
            columns={[
              { key: 'name', header: 'Store' },
              {
                key: 'averageRating',
                header: 'Rating',
                render: (row) => formatRating(row.averageRating),
              },
              {
                key: 'createdAt',
                header: 'Added',
                render: (row) => formatDate(row.createdAt),
              },
            ]}
            rows={recentStores}
            empty={<EmptyState title="No stores yet" description="Assign a store to an owner to see it here." />}
          />
        </div>
      </div>
    </section>
  )
}
