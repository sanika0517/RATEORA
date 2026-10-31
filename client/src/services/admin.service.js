import api from './api'

export function getAdminDashboard() {
  return api.get('/admin/dashboard').then((res) => res.data)
}

export function getAdminUsers(params) {
  return api.get('/admin/users', { params }).then((res) => res.data)
}

export function getAdminUser(userId) {
  return api.get(`/admin/users/${userId}`).then((res) => res.data)
}

export function createAdminUser(payload) {
  return api.post('/admin/users', payload).then((res) => res.data)
}

export function getAdminStores(params) {
  return api.get('/admin/stores', { params }).then((res) => res.data)
}

export function createAdminStore(payload) {
  return api.post('/admin/stores', payload).then((res) => res.data)
}
