const roles = [
  {
    role: 'Administrador',
    users: 2,
    scope: 'Control total',
    status: 'Activo',
  },
  {
    role: 'Almacenista',
    users: 6,
    scope: 'Entradas y salidas',
    status: 'Activo',
  },
  {
    role: 'Compras',
    users: 3,
    scope: 'Proveedores y ordenes',
    status: 'Activo',
  },
  {
    role: 'Auditoria',
    users: 1,
    scope: 'Solo lectura',
    status: 'Revision',
  },
]

const users = [
  {
    name: 'Andrea Ruiz',
    email: 'andrea@inventario.com',
    role: 'Administrador',
    location: 'Matriz',
    state: 'Conectada',
  },
  {
    name: 'Luis Torres',
    email: 'luis@inventario.com',
    role: 'Almacenista',
    location: 'Bodega Norte',
    state: 'Activo',
  },
  {
    name: 'Mariela Soto',
    email: 'mariela@inventario.com',
    role: 'Compras',
    location: 'Matriz',
    state: 'Activo',
  },
  {
    name: 'Carlos Perez',
    email: 'carlos@inventario.com',
    role: 'Auditoria',
    location: 'Remoto',
    state: 'Inactivo',
  },
]

const userActions = ['Crear', 'Editar', 'Eliminar', 'Ver']
const roleActions = ['Crear', 'Editar', 'Eliminar', 'Asignar']

export default function UsersRolesPage() {
  return (
    <>
      <section className="hero-banner users-hero">
        <div>
          <p className="hero-banner-kicker">Seguridad interna</p>
          <h3>Usuarios y roles del inventario</h3>
          <p>Administra permisos por perfil y visibilidad de operaciones.</p>
        </div>
        <div className="hero-badges">
          <span className="status-pill is-ready">12 usuarios activos</span>
          <span className="status-pill is-live">4 roles operativos</span>
        </div>
      </section>

      <section className="users-layout-grid">
        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <span className="section-kicker">Usuarios</span>
              <h3>Gestion de usuarios</h3>
            </div>
            <div className="module-actions">
              {userActions.map((action) => (
                <button className="module-action" type="button" key={action}>
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div className="users-table users-table--compact" role="table" aria-label="Tabla de usuarios">
            <div className="users-head" role="rowgroup">
              <span role="columnheader">Usuario</span>
              <span role="columnheader">Correo</span>
              <span role="columnheader">Rol</span>
              <span role="columnheader">Sede</span>
              <span role="columnheader">Estado</span>
            </div>

            {users.map((item) => (
              <div className="users-row" key={item.email} role="row">
                <span>{item.name}</span>
                <span>{item.email}</span>
                <span>{item.role}</span>
                <span>{item.location}</span>
                <span className={`status-pill ${item.state === 'Inactivo' ? 'is-live' : 'is-ready'}`}>
                  {item.state}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <span className="section-kicker">Roles</span>
              <h3>Gestion de roles</h3>
            </div>
            <div className="module-actions">
              {roleActions.map((action) => (
                <button className="module-action" type="button" key={action}>
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div className="roles-grid">
            {roles.map((item) => (
              <article className="role-card" key={item.role}>
                <strong>{item.role}</strong>
                <p>{item.scope}</p>
                <div className="role-card-meta">
                  <span>{item.users} usuarios</span>
                  <span className={`status-pill ${item.status === 'Revision' ? 'is-live' : 'is-ready'}`}>
                    {item.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>
    </>
  )
}