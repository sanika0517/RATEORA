export const TOKEN_KEY = 'rateora_token'

export const ROLES = {
  ADMIN: 'ADMIN',
  NORMAL_USER: 'NORMAL_USER',
  STORE_OWNER: 'STORE_OWNER',
}

export const ROLE_HOME = {
  ADMIN: '/admin',
  NORMAL_USER: '/app',
  STORE_OWNER: '/owner',
}

export const ROLE_LABELS = {
  ADMIN: 'Admin',
  NORMAL_USER: 'Member',
  STORE_OWNER: 'Store owner',
}

export const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: ROLE_LABELS.ADMIN },
  { value: ROLES.NORMAL_USER, label: ROLE_LABELS.NORMAL_USER },
  { value: ROLES.STORE_OWNER, label: ROLE_LABELS.STORE_OWNER },
]

export const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'All roles' },
  ...ROLE_OPTIONS,
]

export const ADMIN_USER_SORT_FIELDS = ['name', 'email', 'createdAt']
export const ADMIN_STORE_SORT_FIELDS = ['name', 'email', 'createdAt']
export const MEMBER_STORE_SORT_FIELDS = ['name', 'address', 'createdAt']

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
