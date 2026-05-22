import { useState } from 'react'
import {
  BarChart3,
  Menu,
  ShieldCheck,
  Tags,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext.jsx'
import { Link, useLocation, useNavigate } from '../router/AppRouter.jsx'

const sidebarLinks = [
  {
    title: 'Resumen',
    hint: 'Vista general',
    href: '/app',
    icon: BarChart3,
  },
  {
    title: 'Usuarios y roles',
    hint: 'Permisos',
    href: '/app/usuarios',
    icon: Users,
  },
  {
    title: 'Movimientos',
    hint: 'Entradas / salidas',
    href: '/app',
    icon: Tags,
  },
  {
    title: 'Reportes',
    hint: 'Analisis',
    href: '/app',
    icon: ShieldCheck,
  },
]

export default function AuthenticatedLayout({ kicker, title, children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="dashboard-shell">
      <div
        className={`dashboard-layout ${isSidebarCollapsed ? 'is-sidebar-collapsed' : ''}`}
        style={{ '--sidebar-width': isSidebarCollapsed ? '92px' : '280px' }}
      >
        <aside className={`app-sidebar ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
          <div className="sidebar-brand">
            <div className="profile-mark">IT</div>
            <div>
              <strong>Inventario TEC</strong>
              <span>Centro de control</span>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Navegacion principal">
            {sidebarLinks.map((link) => (
              <Link
                className={`sidebar-link ${location.pathname === link.href ? 'is-active' : ''}`}
                key={link.title}
                to={link.href}
              >
                <span className="sidebar-link-icon" aria-hidden="true">
                  <link.icon size={18} />
                </span>
                <span className="sidebar-link-copy">
                  <strong>{link.title}</strong>
                  <span>{link.hint}</span>
                </span>
              </Link>
            ))}
          </nav>

          <div className="sidebar-card-glow">
            <p className="sidebar-card-title">Estado operativo</p>
            <p className="sidebar-card-value">99.2% disponibilidad</p>
            <p className="sidebar-card-note">Actualizado en tiempo real</p>
          </div>
        </aside>

        <section className="dashboard-main">
          <header className="dashboard-topbar">
            <div className="topbar-heading">
              <button
                className="ghost-action hamburger-action"
                type="button"
                onClick={() => setIsSidebarCollapsed((value) => !value)}
                aria-label={isSidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
              >
                {isSidebarCollapsed ? <Menu size={18} /> : <X size={18} />}
              </button>
              <div>
                <span className="section-kicker">{kicker}</span>
                <h2>{title}</h2>
              </div>
            </div>

            <div className="topbar-actions">
              <button className="ghost-action" type="button">
                Alertas
              </button>
              <div className="topbar-user">
                <span>{user?.initials ?? 'IT'}</span>
                <small>{user?.email ?? 'sin correo'}</small>
              </div>
              <button className="dashboard-action" type="button" onClick={handleLogout}>
                Cerrar sesion
              </button>
            </div>
          </header>

          {children}
        </section>
      </div>
    </main>
  )
}