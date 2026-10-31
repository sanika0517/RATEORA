import api from './api'

export function registerUser(payload) {
  return api.post('/auth/register', payload).then((res) => res.data)
}

export function loginUser(payload) {
  return api.post('/auth/login', payload).then((res) => res.data)
}

export function fetchCurrentUser() {
  return api.get('/auth/me').then((res) => res.data)
}

export function changePassword(payload) {
  return api.post('/auth/change-password', payload).then((res) => res.data)
}

export function logoutUser() {
  return api.post('/auth/logout').then((res) => res.data)
}
