import { useState } from 'react'
import { useDebounce } from './useDebounce'

export function useDirectoryQuery({
  sortBy: initialSortBy = 'createdAt',
  order: initialOrder = 'desc',
} = {}) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
  const [role, setRole] = useState('')
  const [sortBy, setSortBy] = useState(initialSortBy)
  const [order, setOrder] = useState(initialOrder)
  const [page, setPage] = useState(1)
  const filterKey = `${debouncedSearch}|${role}|${sortBy}|${order}`
  const [seenKey, setSeenKey] = useState(filterKey)

  if (filterKey !== seenKey) {
    setSeenKey(filterKey)
    setPage(1)
  }

  const handleSort = (key, nextOrder) => {
    setSortBy(key)
    setOrder(nextOrder)
  }

  return {
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
  }
}
