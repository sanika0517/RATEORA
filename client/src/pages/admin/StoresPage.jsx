import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import SearchBar from '../../components/common/SearchBar'
import RatingStars from '../../components/ratings/RatingStars'
import DataTable from '../../components/tables/DataTable'
import { useDirectoryQuery } from '../../hooks/useDirectoryQuery'
import { getAdminStores } from '../../services/admin.service'
import { formatDate, formatRating, getApiError } from '../../utils/formatters'

export default function StoresPage() {
  const {
    search,
    setSearch,
    debouncedSearch,
    sortBy,
    order,
    page,
    setPage,
    handleSort,
  } = useDirectoryQuery()

  const [stores, setStores] = useState([])
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 })
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getAdminStores({
        search: debouncedSearch || undefined,
        sortBy,
        order,
        page,
        limit: 10,
      })
      setStores(response.data.stores)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(getApiError(err, 'Unable to load stores'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, sortBy, order, page])

  return (
    <section className="space-y-8">
      <PageHeader
        title="Stores"
        description="Search by name, email, or address. Ratings and owner details come from the live store directory."
        actions={
          <Button as={Link} to="/admin/stores/new">
            Add store
          </Button>
        }
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search name, email, or address"
      />

      {error ? (
        <ErrorState description={error} onRetry={load} />
      ) : loading ? (
        <LoadingSpinner label="Loading stores" />
      ) : (
        <>
          <DataTable
            sortBy={sortBy}
            order={order}
            onSort={handleSort}
            onRowClick={setSelected}
            columns={[
              { key: 'name', header: 'Store', sortKey: 'name' },
              { key: 'email', header: 'Email', sortKey: 'email' },
              {
                key: 'owner',
                header: 'Owner',
                render: (row) => row.owner?.name || '—',
              },
              {
                key: 'averageRating',
                header: 'Rating',
                render: (row) => (
                  <span className="inline-flex items-center gap-2">
                    <RatingStars value={row.averageRating} readOnly size={14} />
                    {formatRating(row.averageRating)}
                  </span>
                ),
              },
              {
                key: 'createdAt',
                header: 'Added',
                sortKey: 'createdAt',
                render: (row) => formatDate(row.createdAt),
              },
            ]}
            rows={stores}
            empty={
              <EmptyState
                title="No stores found"
                description="Create a store and assign it to an existing store owner."
                action={
                  <Button as={Link} to="/admin/stores/new" variant="secondary">
                    Add store
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

      <Modal
        open={Boolean(selected)}
        title={selected?.name}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="mt-1 text-ink">{selected.email}</dd>
            </div>
            <div>
              <dt className="text-muted">Address</dt>
              <dd className="mt-1 leading-6 text-ink">{selected.address}</dd>
            </div>
            <div>
              <dt className="text-muted">Owner</dt>
              <dd className="mt-1 text-ink">
                {selected.owner?.name} · {selected.owner?.email}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Rating</dt>
              <dd className="mt-2 flex items-center gap-3">
                <RatingStars value={selected.averageRating} readOnly />
                <span>{formatRating(selected.averageRating)}</span>
                <span className="text-muted">{selected.totalRatings} ratings</span>
              </dd>
            </div>
          </dl>
        )}
      </Modal>
    </section>
  )
}
