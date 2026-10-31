import api from './api'

export function getStores(params) {
  return api.get('/stores', { params }).then((res) => res.data)
}
