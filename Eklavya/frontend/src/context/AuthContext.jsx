import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchMe, setAuthToken } from '../api/client'

const AuthContext = createContext(null)

const STORAGE_KEY = 'eklavya_auth'

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { token: null, user: null }
    return JSON.parse(raw)
  } catch {
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => loadStored().token)
  const [user, setUser] = useState(() => loadStored().user)
  const [loading, setLoading] = useState(!!loadStored().token)

  const persist = useCallback((nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    setAuthToken(nextToken)
    if (nextToken && nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const loginSuccess = useCallback(
    (data) => {
      persist(data.access_token, data.user)
    },
    [persist]
  )

  const logout = useCallback(() => {
    persist(null, null)
  }, [persist])

  useEffect(() => {
    setAuthToken(token)
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetchMe()
      .then((res) => {
        if (!cancelled) setUser(res.data)
      })
      .catch(() => {
        if (!cancelled) persist(null, null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token, persist])

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      loginSuccess,
      logout,
      isAdmin: user?.role === 'admin',
      isParent: user?.role === 'parent',
    }),
    [token, user, loading, loginSuccess, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
