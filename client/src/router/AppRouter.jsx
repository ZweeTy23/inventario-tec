import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import App from '../App.jsx'
import { AuthProvider } from '../auth/AuthContext.jsx'
import { GuestOnlyRoute, ProtectedRoute } from '../components/RouteGuards.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import UsersRolesPage from '../pages/UsersRolesPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import AuthenticatedLayout from '../components/AuthenticatedLayout.jsx'

import ProductsPage from '../pages/ProductsPage.jsx'
import CategoriesPage from '../pages/CategoriesPage.jsx'
import SuppliersPage from '../pages/SuppliersPage.jsx'

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
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'usuarios',
        element: <UsersRolesPage />,
      },
      {
        path: 'productos',
        element: <ProductsPage />,
      },
      {
        path: 'categorias',
        element: <CategoriesPage />,
      },
      {
        path: 'proveedores',
        element: <SuppliersPage />,
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
