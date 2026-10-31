import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import FilterDropdown from '../../components/common/FilterDropdown'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import SearchBar from '../../components/common/SearchBar'
import DataTable from '../../components/tables/DataTable'
import AdminUserActions from '../../components/admin/AdminUserActions'
import { useDirectoryQuery } from '../../hooks/useDirectoryQuery'
import { useAuth } from '../../hooks/useAuth'
import { getAdminUsers } from '../../services/admin.service'
import { ROLE_FILTER_OPTIONS } from '../../utils/constants'
import { formatDate, getApiError } from '../../utils/formatters'

export default function UsersPage() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const {
    search,
    setSearch,
    debouncedSearch,
    role,
    setRole,
    sortBy,
    order,
    page,
    setPage,
    handleSort,
  } = useDirectoryQuery()

  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getAdminUsers({
        search: debouncedSearch || undefined,
        role: role || undefined,
        sortBy,
        order,
        page,
        limit: 10,
      })
      setUsers(response.data.users)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(getApiError(err, 'Unable to load users'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, role, sortBy, order, page])

  return (
    <section className="space-y-8">
      <PageHeader
        title="Users"
        description="Search by name, email, or address. Filter by role and sort the directory."
        actions={
          <Button as={Link} to="/admin/users/new">
            Add user
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-[1fr_200px]">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search name, email, or address"
        />
        <FilterDropdown value={role} onChange={setRole} options={ROLE_FILTER_OPTIONS} />
      </div>

      {error ? (
        <ErrorState description={error} onRetry={load} />
      ) : loading ? (
        <LoadingSpinner label="Loading users" />
      ) : (
        <>
          <DataTable
            sortBy={sortBy}
            order={order}
            onSort={handleSort}
            onRowClick={(row) => navigate(`/admin/users/${row.id}`)}
            columns={[
              { key: 'name', header: 'Name', sortKey: 'name' },
              { key: 'email', header: 'Email', sortKey: 'email' },
              {
                key: 'address',
                header: 'Address',
                render: (row) => (
                  <span className="block max-w-xs truncate text-muted">{row.address}</span>
                ),
              },
              {
                key: 'role',
                header: 'Role',
                render: (row) => <Badge role={row.role} />,
              },
              {
                key: 'createdAt',
                header: 'Joined',
                sortKey: 'createdAt',
                render: (row) => formatDate(row.createdAt),
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (row) => (
                  <AdminUserActions
                    user={row}
                    currentUserId={currentUser?.id}
                    onUpdated={load}
                    onDeleted={() => {
                      if (users.length === 1 && page > 1) setPage(page - 1)
                      else load()
                    }}
                  />
                ),
              },
            ]}
            rows={users}
            empty={
              <EmptyState
                title="No users found"
                description="Try a different search or create a new account."
                action={
                  <Button as={Link} to="/admin/users/new" variant="secondary">
                    Add user
                  </Button>
                }
              />
            }
          />
          <Pagination
            page={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  )
}
