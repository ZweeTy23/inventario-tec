import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import App from '../App.jsx'
import { AuthProvider } from '../auth/AuthContext.jsx'
import { GuestOnlyRoute, ProtectedRoute, PermissionRoute } from '../components/RouteGuards.jsx'
import { PERMISSIONS } from '../lib/constants'
import LoginPage from '../pages/LoginPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import UsersRolesPage from '../pages/UsersRolesPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import AuthenticatedLayout from '../components/AuthenticatedLayout.jsx'
import ProductsPage from '../pages/ProductsPage.jsx'
import CategoriesPage from '../pages/CategoriesPage.jsx'
import SuppliersPage from '../pages/SuppliersPage.jsx'
import LocationsPage from '../pages/LocationsPage.jsx'
import StockLevelsPage from '../pages/StockLevelsPage.jsx'
import MovementsPage from '../pages/MovementsPage.jsx'
import AuditLogsPage from '../pages/AuditLogsPage.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
  },
  {
    path: '/login',
    element: (
      <GuestOnlyRoute>
        <LoginPage />
      </GuestOnlyRoute>
    ),
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AuthenticatedLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'usuarios', element: <UsersRolesPage /> },
      {
        path: 'productos',
        element: (
          <PermissionRoute permissions={[PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.PRODUCTS_UPDATE, PERMISSIONS.PRODUCTS_DELETE]} any>
            <ProductsPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'categorias',
        element: (
          <PermissionRoute permissions={[PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_CREATE]} any>
            <CategoriesPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'proveedores',
        element: (
          <PermissionRoute permissions={[PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_CREATE]} any>
            <SuppliersPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'ubicaciones',
        element: (
          <PermissionRoute permissions={[PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_CREATE]} any>
            <LocationsPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'stock',
        element: (
          <PermissionRoute permissions={[PERMISSIONS.INVENTORY_VIEW]}>
            <StockLevelsPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'movimientos',
        element: (
          <PermissionRoute permissions={[PERMISSIONS.MOVEMENTS_VIEW, PERMISSIONS.MOVEMENTS_CREATE, PERMISSIONS.MOVEMENTS_APPROVE]} any>
            <MovementsPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'auditoria',
        element: (
          <PermissionRoute permissions={[PERMISSIONS.REPORTS_VIEW]}>
            <AuditLogsPage />
          </PermissionRoute>
        ),
      },
    ],
  },
])

export function AppRouter() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
