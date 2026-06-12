import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

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

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession())
  const [loading, setLoading] = useState(false)

  const authApi = useMemo(() => {
    return {
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.user),
      loading,
      
      login: async (email, password) => {
        setLoading(true)
        try {
          const { data } = await api.post('/auth/login', { email, password })
          
          localStorage.setItem(TOKEN_KEY, data.token)
          const nextSession = {
            user: {
              ...data.user,
              initials: data.user.name
                .split(' ')
                .filter(Boolean)
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase(),
            },
            startedAt: new Date().toISOString(),
          }
          
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
          setSession(nextSession)
          return { success: true }
        } catch (error) {
          console.error('Login error:', error)
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
