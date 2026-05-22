import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'inventario-tec-auth-session'

const AuthContext = createContext(null)

function readSession() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawSession = window.localStorage.getItem(STORAGE_KEY)
    return rawSession ? JSON.parse(rawSession) : null
  } catch {
    return null
  }
}

function saveSession(session) {
  if (typeof window === 'undefined') {
    return
  }

  if (session) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
}

function createUserPayload({ name, email }) {
  const safeEmail = email.trim().toLowerCase()
  const safeName = name.trim() || safeEmail.split('@')[0] || 'Usuario'

  return {
    id: crypto.randomUUID(),
    name: safeName,
    email: safeEmail,
    initials: safeName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession())

  useEffect(() => {
    saveSession(session)
  }, [session])

  const authApi = useMemo(() => {
    const setAuthenticatedUser = (payload) => {
      const nextSession = {
        user: createUserPayload(payload),
        startedAt: new Date().toISOString(),
      }

      setSession(nextSession)
      return { success: true, user: nextSession.user }
    }

    return {
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.user),
      login: (payload) => setAuthenticatedUser(payload),
      register: (payload) => setAuthenticatedUser(payload),
      logout: () => setSession(null),
    }
  }, [session])

  return <AuthContext.Provider value={authApi}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}