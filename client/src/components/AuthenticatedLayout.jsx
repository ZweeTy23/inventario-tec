import { useState } from 'react'
import {
  BarChart3,
  ShieldCheck,
  Users,
  Package,
  Layers,
  Truck,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Boxes,
  ArrowLeftRight,
  ClipboardList,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext.jsx'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { Avatar } from 'flowbite-react'
import { PERMISSIONS, ROLE_LABELS } from '../lib/constants'
import NotificationBell from './NotificationBell'

const allLinks = [
  { title: 'Dashboard', hint: 'Vista general', href: '/app', icon: BarChart3, permissions: [] },
  { title: 'Productos', hint: 'Catálogo base', href: '/app/productos', icon: Package, permissions: [PERMISSIONS.PRODUCTS_VIEW], any: true },
  { title: 'Categorías', hint: 'Clasificación', href: '/app/categorias', icon: Layers, permissions: [PERMISSIONS.PRODUCTS_VIEW], any: true },
  { title: 'Proveedores', hint: 'Abastecimiento', href: '/app/proveedores', icon: Truck, permissions: [PERMISSIONS.PRODUCTS_VIEW], any: true },
  { title: 'Ubicaciones', hint: 'Almacén multilevel', href: '/app/ubicaciones', icon: MapPin, permissions: [PERMISSIONS.INVENTORY_VIEW], any: true },
  { title: 'Stock', hint: 'Niveles y lotes', href: '/app/stock', icon: Boxes, permissions: [PERMISSIONS.INVENTORY_VIEW], any: true },
  { title: 'Movimientos', hint: 'Entradas y salidas', href: '/app/movimientos', icon: ArrowLeftRight, permissions: [PERMISSIONS.MOVEMENTS_VIEW, PERMISSIONS.MOVEMENTS_CREATE], any: true },
  { title: 'Auditoría', hint: 'Bitácora de cambios', href: '/app/auditoria', icon: ClipboardList, permissions: [PERMISSIONS.REPORTS_VIEW], any: true },
  { title: 'Usuarios y roles', hint: 'Gestión de acceso', href: '/app/usuarios', icon: Users, permissions: [] },
]

export default function AuthenticatedLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, hasAnyPermission } = useAuth()

  const sidebarLinks = allLinks.filter((link) =>
    link.permissions.length === 0 || hasAnyPermission(...link.permissions)
  )

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const currentPath = location.pathname
  const currentLink = sidebarLinks.find((link) => link.href === currentPath) || sidebarLinks[0]
  const roleLabel = ROLE_LABELS[user?.role?.name] ?? user?.role?.name ?? 'Usuario'

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans">
      <aside
        className={`flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out z-30 shadow-xl shadow-gray-200/50 dark:shadow-none ${
          isSidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div className="flex items-center h-20 px-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white shrink-0 shadow-lg shadow-indigo-200">
            <Package size={22} />
          </div>
          {!isSidebarCollapsed && (
            <div className="ml-4 overflow-hidden">
              <h1 className="text-base font-black text-gray-900 dark:text-white truncate tracking-tight uppercase">Inventario TEC</h1>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest truncate">Panel de Control</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = currentPath === link.href
            return (
              <Link
                key={link.title}
                to={link.href}
                className={`flex items-center px-4 py-3 rounded-2xl transition-all group relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <link.icon className={`shrink-0 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} size={20} />
                {!isSidebarCollapsed && (
                  <div className="ml-4 flex flex-col overflow-hidden">
                    <span className="text-sm font-bold truncate leading-none mb-1">{link.title}</span>
                    <span className={`text-[10px] truncate leading-none ${isActive ? 'text-indigo-100' : 'text-gray-400'}`}>{link.hint}</span>
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex items-center justify-center w-full p-3 text-gray-400 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-xl transition-all"
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden relative">
        <header className="flex items-center justify-between h-20 px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-20">
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{currentLink?.title}</h2>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">{currentLink?.hint}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2">
              <NotificationBell />
              <button className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-xl transition-all">
                <Settings size={20} />
              </button>
            </div>

            <div className="flex items-center pl-6 border-l border-gray-100 dark:border-gray-800 gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user?.name}</span>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter mt-1">{roleLabel}</span>
              </div>
              <Avatar placeholderInitials={user?.initials} rounded size="md" className="ring-2 ring-indigo-100 dark:ring-indigo-900 ring-offset-2 dark:ring-offset-gray-900" />
              <button onClick={handleLogout} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" title="Cerrar sesión">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
