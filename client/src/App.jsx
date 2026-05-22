import { useAuth } from './auth/AuthContext.jsx'
import AuthenticatedLayout from './components/AuthenticatedLayout.jsx'
import { GuestOnlyRoute, ProtectedRoute } from './components/RouteGuards.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import UsersRolesPage from './pages/UsersRolesPage.jsx'
import { Navigate, useLocation } from './router/AppRouter.jsx'
import './App.css'

function App() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const pathname = location.pathname

  if (pathname === '/') {
    return <Navigate to={isAuthenticated ? '/app' : '/login'} replace />
  }

  if (pathname === '/login') {
    return (
      <GuestOnlyRoute>
        <LoginPage />
      </GuestOnlyRoute>
    )
  }

  if (pathname === '/registro') {
    return <Navigate to="/login" replace />
  }

  if (pathname === '/app') {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout kicker="Inventario general" title="Dashboard operativo">
          <DashboardPage />
        </AuthenticatedLayout>
      </ProtectedRoute>
    )
  }

  if (pathname === '/app/usuarios') {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout kicker="Gestion de acceso" title="Usuarios y roles">
          <UsersRolesPage />
        </AuthenticatedLayout>
      </ProtectedRoute>
    )
  }

  return <NotFoundPage />
}

export default App
