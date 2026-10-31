import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  changePassword as changePasswordRequest,
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '../services/auth.service'
import { TOKEN_KEY } from '../utils/constants'
import { AuthContext } from './auth-context'

function persistToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [isReady, setIsReady] = useState(() => !localStorage.getItem(TOKEN_KEY))

  const clearSession = useCallback(() => {
    persistToken(null)
    setToken(null)
    setUser(null)
  }, [])

  const hydrate = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY)

    if (!storedToken) {
      setUser(null)
      setToken(null)
      setIsReady(true)
      return
    }

    try {
      const response = await fetchCurrentUser()
      setToken(storedToken)
      setUser(response.user)
    } catch {
      clearSession()
    } finally {
      setIsReady(true)
    }
  }, [clearSession])

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (!storedToken) return undefined

    let cancelled = false

    ;(async () => {
      try {
        const response = await fetchCurrentUser()
        if (cancelled) return
        setToken(storedToken)
        setUser(response.user)
      } catch {
        if (!cancelled) clearSession()
      } finally {
        if (!cancelled) setIsReady(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [clearSession])

  useEffect(() => {
    const onUnauthorized = () => {
      setUser((current) => {
        if (current) {
          toast.error('Your session expired. Please sign in again.')
        }
        return null
      })
      persistToken(null)
      setToken(null)
    }

    window.addEventListener('rateora:unauthorized', onUnauthorized)
    return () => window.removeEventListener('rateora:unauthorized', onUnauthorized)
  }, [])

  const applyAuthPayload = useCallback((payload) => {
    persistToken(payload.token)
    setToken(payload.token)
    setUser(payload.user)
    return payload.user
  }, [])

  const login = useCallback(
    async (credentials) => {
      const payload = await loginUser(credentials)
      return applyAuthPayload(payload)
    },
    [applyAuthPayload]
  )

  const register = useCallback(
    async (values) => {
      const payload = await registerUser(values)
      return applyAuthPayload(payload)
    },
    [applyAuthPayload]
  )

  const logout = useCallback(async () => {
    try {
      if (localStorage.getItem(TOKEN_KEY)) {
        await logoutUser()
      }
    } catch {
      // Session is cleared locally even if the API call fails.
    } finally {
      clearSession()
    }
  }, [clearSession])

  const updatePassword = useCallback(async (values) => {
    const payload = await changePasswordRequest(values)
    clearSession()
    return payload
  }, [clearSession])

  const value = useMemo(
    () => ({
      user,
      token,
      isReady,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      updatePassword,
      refreshUser: hydrate,
    }),
    [user, token, isReady, login, register, logout, updatePassword, hydrate]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
