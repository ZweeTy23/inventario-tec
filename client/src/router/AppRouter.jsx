import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const RouterContext = createContext(null)

function readPathname() {
  if (typeof window === 'undefined') {
    return '/'
  }

  return window.location.pathname || '/'
}

export function AppRouterProvider({ children }) {
  const [pathname, setPathname] = useState(() => readPathname())

  useEffect(() => {
    const handlePopState = () => {
      setPathname(readPathname())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const value = useMemo(() => {
    const navigate = (to, { replace = false } = {}) => {
      if (typeof window === 'undefined') {
        return
      }

      if (replace) {
        window.history.replaceState({}, '', to)
      } else {
        window.history.pushState({}, '', to)
      }

      setPathname(to)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }

    return {
      pathname,
      navigate,
    }
  }, [pathname])

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useAppRouter() {
  const context = useContext(RouterContext)

  if (!context) {
    throw new Error('useAppRouter must be used within AppRouterProvider')
  }

  return context
}

export function useLocation() {
  const { pathname } = useAppRouter()
  return { pathname, state: null }
}

export function useNavigate() {
  return useAppRouter().navigate
}

export function Link({ to, replace = false, className, children, ...rest }) {
  const navigate = useNavigate()

  function handleClick(event) {
    if (
      rest.target === '_blank' ||
      rest.download !== undefined ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return
    }

    event.preventDefault()
    navigate(to, { replace })
  }

  return (
    <a href={to} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}

export function Navigate({ to, replace = false }) {
  const navigate = useNavigate()

  useEffect(() => {
    navigate(to, { replace })
  }, [navigate, replace, to])

  return null
}