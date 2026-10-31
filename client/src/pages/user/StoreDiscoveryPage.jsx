import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import FilterDropdown from '../../components/common/FilterDropdown'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import SearchBar from '../../components/common/SearchBar'
import RatingStars from '../../components/ratings/RatingStars'
import { useDirectoryQuery } from '../../hooks/useDirectoryQuery'
import { submitRating } from '../../services/rating.service'
import { getStores } from '../../services/store.service'
import { formatRating, getApiError } from '../../utils/formatters'

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'address', label: 'Address' },
  { value: 'createdAt', label: 'Newest' },
]

const ORDER_OPTIONS = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
]

export default function StoreDiscoveryPage() {
  const {
    search,
    setSearch,
    debouncedSearch,
    sortBy,
    order,
    page,
    setPage,
    handleSort,
  } = useDirectoryQuery({ sortBy: 'name', order: 'asc' })

  const [stores, setStores] = useState([])
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getStores({
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

  const handleRate = async (storeId, rating) => {
    setSavingId(storeId)

    try {
      const response = await submitRating(storeId, rating)
      const refreshed = await getStores({
        search: debouncedSearch || undefined,
        sortBy,
        order,
        page,
        limit: 10,
      })
      setStores(refreshed.data.stores)
      setPagination(refreshed.data.pagination)
      toast.success(response.message || 'Rating saved')
    } catch (err) {
      toast.error(getApiError(err, 'Unable to save rating'))
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="space-y-8">
      <PageHeader
        title="Stores"
        description="Search registered stores, see overall ratings, and submit or update your own score."
      />

      <div className="grid gap-3 md:grid-cols-[1fr_160px_160px]">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by store name or address"
        />
        <FilterDropdown
          value={sortBy}
          onChange={(value) => handleSort(value, order)}
          options={SORT_OPTIONS}
        />
        <FilterDropdown
          value={order}
          onChange={(value) => handleSort(sortBy, value)}
          options={ORDER_OPTIONS}
        />
      </div>

      {error ? (
        <ErrorState description={error} onRetry={load} />
      ) : loading ? (
        <LoadingSpinner label="Loading stores" />
      ) : stores.length === 0 ? (
        <EmptyState
          title="No stores found"
          description="No registered stores match this search."
        />
      ) : (
        <>
          <ul className="space-y-3">
            {stores.map((store) => (
              <li
                key={store.id}
                className="rounded-2xl border border-line bg-card p-5 transition-colors hover:border-muted/40"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-base font-medium text-ink">{store.name}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted">{store.address}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:w-[420px]">
                    <div>
                      <p className="text-xs tracking-wide text-muted uppercase">Overall rating</p>
                      <div className="mt-2 flex items-center gap-2">
                        <RatingStars value={store.averageRating} readOnly />
                        <span className="text-sm text-ink">{formatRating(store.averageRating)}</span>
                        <span className="text-xs text-muted">{store.totalRatings}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs tracking-wide text-muted uppercase">My rating</p>
                      <div className="mt-2 flex items-center gap-3">
                        <RatingStars
                          value={store.userRating || 0}
                          disabled={savingId === store.id}
                          onChange={(rating) => handleRate(store.id, rating)}
                        />
                        <span className="text-sm text-muted">
                          {store.userRating ? `${store.userRating}/5` : 'Not rated'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
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
