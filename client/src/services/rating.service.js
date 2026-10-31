import api from './api'

export function submitRating(storeId, rating) {
  return api.post(`/ratings/${storeId}`, { rating }).then((res) => res.data)
}
