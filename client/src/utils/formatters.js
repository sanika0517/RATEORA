export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data

  if (data?.errors?.length) {
    return data.errors[0].message || data.message || fallback
  }

  return data?.message || error?.message || fallback
}

export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (!parts.length) return 'R'

  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatRating(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—'
  }

  return Number(value).toFixed(2)
}

export function nextSortOrder(currentKey, nextKey, currentOrder = 'desc') {
  if (currentKey === nextKey) {
    return currentOrder === 'asc' ? 'desc' : 'asc'
  }

  return 'asc'
}
