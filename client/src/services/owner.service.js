import api from './api'

export function getOwnerDashboard() {
  return api.get('/owner/dashboard').then((res) => res.data)
}
