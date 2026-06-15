import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { getInitials } from '../lib/format'

const STORAGE_KEY = 'inventario-tec-auth-session'
const TOKEN_KEY = 'inventario-tec-token'

const AuthContext = createContext(null)

function readSession() {
  if (typeof window === 'undefined') return null
  try {
    const rawSession = window.localStorage.getItem(STORAGE_KEY)
    return rawSession ? JSON.parse(rawSession) : null
  } catch {
    return null
  }
}

function buildUser(userData) {
  return {
    ...userData,
    initials: getInitials(userData.name),
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function refreshSession() {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const { data } = await api.get('/auth/me')
        const nextSession = {
          user: buildUser(data),
          startedAt: session?.startedAt ?? new Date().toISOString(),
        }
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
        setSession(nextSession)
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
        window.localStorage.removeItem(TOKEN_KEY)
        setSession(null)
      } finally {
        setLoading(false)
      }
    }
    refreshSession()
  }, [])

  const authApi = useMemo(() => {
    const permissions = session?.user?.permissions ?? []

    return {
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.user),
      loading,

      hasPermission: (...required) => required.every((p) => permissions.includes(p)),
      hasAnyPermission: (...required) => required.some((p) => permissions.includes(p)),

      login: async (email, password) => {
        setLoading(true)
        try {
          const { data } = await api.post('/auth/login', { email, password })
          localStorage.setItem(TOKEN_KEY, data.token)
          const nextSession = {
            user: buildUser(data.user),
            startedAt: new Date().toISOString(),
          }
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
          setSession(nextSession)
          return { success: true }
        } catch (error) {
          return { success: false, error: error.message }
        } finally {
          setLoading(false)
        }
      },

      logout: () => {
        window.localStorage.removeItem(STORAGE_KEY)
        window.localStorage.removeItem(TOKEN_KEY)
        setSession(null)
      },
    }
  }, [session, loading])

  return <AuthContext.Provider value={authApi}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
