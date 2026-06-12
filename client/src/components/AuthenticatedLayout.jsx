import { useState } from 'react'
import {
  BarChart3,
  Menu,
  ShieldCheck,
  Tags,
  Users,
  X,
  Package,
  Layers,
  Truck,
  LogOut,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext.jsx'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { Button, Avatar, Tooltip } from 'flowbite-react'

const sidebarLinks = [
  { title: 'Dashboard', hint: 'Vista general', href: '/app', icon: BarChart3 },
  { title: 'Productos', hint: 'Catálogo base', href: '/app/productos', icon: Package },
  { title: 'Categorías', hint: 'Clasificación', href: '/app/categorias', icon: Layers },
  { title: 'Proveedores', hint: 'Abastecimiento', href: '/app/proveedores', icon: Truck },
  { title: 'Usuarios y roles', hint: 'Gestión de acceso', href: '/app/usuarios', icon: Users },
]

export default function AuthenticatedLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const currentPath = location.pathname
  const currentLink = sidebarLinks.find(link => link.href === currentPath) || sidebarLinks[0]

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans">
      {/* Sidebar */}
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
            <div className="ml-4 overflow-hidden animate-in fade-in duration-500">
              <h1 className="text-base font-black text-gray-900 dark:text-white truncate tracking-tight uppercase">Inventario TEC</h1>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest truncate">Panel de Control</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
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
                  <div className="ml-4 flex flex-col overflow-hidden animate-in slide-in-from-left-2 duration-300">
                    <span className="text-sm font-bold truncate leading-none mb-1">{link.title}</span>
                    <span className={`text-[10px] truncate leading-none ${isActive ? 'text-indigo-100' : 'text-gray-400'}`}>{link.hint}</span>
                  </div>
                )}
                {isActive && !isSidebarCollapsed && (
                   <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          {!isSidebarCollapsed && (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/10 p-4 rounded-2xl mb-4 border border-indigo-100/50 dark:border-indigo-800/50">
              <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Estado Operativo</p>
              <div className="flex items-center mt-2 justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Sincronizado</p>
                </div>
                <span className="text-[10px] font-bold text-indigo-500">99.2%</span>
              </div>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex items-center justify-center w-full p-3 text-gray-400 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-xl transition-all"
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <header className="flex items-center justify-between h-20 px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-20">
          <div className="flex items-center">
             <div className="flex flex-col">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                {currentLink.title}
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">{currentLink.hint}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2">
              <button className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-xl transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
              </button>
              <button className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-xl transition-all">
                <Settings size={20} />
              </button>
            </div>
            
            <div className="flex items-center pl-6 border-l border-gray-100 dark:border-gray-800 gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user?.name}</span>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter mt-1">Admin Especialista</span>
              </div>
              <Avatar 
                placeholderInitials={user?.initials} 
                rounded 
                size="md"
                className="ring-2 ring-indigo-100 dark:ring-indigo-900 ring-offset-2 dark:ring-offset-gray-900"
              />
              <button 
                onClick={handleLogout}
                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                title="Cerrar sesión"
              >
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
