import { useState } from 'react'
import { Users, Shield, Plus, MoreVertical, Edit2, Trash2, MapPin, Mail, CheckCircle2, Clock } from 'lucide-react'

const roles = [
  {
    role: 'Administrador',
    users: 2,
    scope: 'Control total del sistema',
    status: 'Activo',
    permissions: 42
  },
  {
    role: 'Almacenista',
    users: 6,
    scope: 'Registro de entradas y salidas',
    status: 'Activo',
    permissions: 18
  },
  {
    role: 'Compras',
    users: 3,
    scope: 'Proveedores y órdenes de compra',
    status: 'Activo',
    permissions: 24
  },
  {
    role: 'Auditoría',
    users: 1,
    scope: 'Reportes y solo lectura',
    status: 'Revision',
    permissions: 12
  },
]

const users = [
  {
    name: 'Andrea Ruiz',
    email: 'andrea@inventario.com',
    role: 'Administrador',
    location: 'Sede Matriz',
    state: 'Conectada',
    lastSeen: 'Ahora'
  },
  {
    name: 'Luis Torres',
    email: 'luis@inventario.com',
    role: 'Almacenista',
    location: 'Bodega Norte',
    state: 'Activo',
    lastSeen: 'Hace 15m'
  },
  {
    name: 'Mariela Soto',
    email: 'mariela@inventario.com',
    role: 'Compras',
    location: 'Sede Matriz',
    state: 'Activo',
    lastSeen: 'Ayer'
  },
  {
    name: 'Carlos Perez',
    email: 'carlos@inventario.com',
    role: 'Auditoría',
    location: 'Remoto',
    state: 'Inactivo',
    lastSeen: 'Hace 3 días'
  },
]

export default function UsersRolesPage() {
  const [activeTab, setActiveTab] = useState('usuarios')

  return (
    <div className="space-y-6">
      {/* Tabs / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
        <div className="flex space-x-8">
          <button 
            onClick={() => setActiveTab('usuarios')}
            className={`pb-4 text-sm font-bold transition-colors relative ${
              activeTab === 'usuarios' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Usuarios
            {activeTab === 'usuarios' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('roles')}
            className={`pb-4 text-sm font-bold transition-colors relative ${
              activeTab === 'roles' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Roles y Permisos
            {activeTab === 'roles' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>}
          </button>
        </div>
        <div className="mb-4 sm:mb-0">
          <button className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
            <Plus size={18} className="mr-2" />
            {activeTab === 'usuarios' ? 'Nuevo Usuario' : 'Nuevo Rol'}
          </button>
        </div>
      </div>

      {activeTab === 'usuarios' ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Perfil</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.email} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <Mail size={12} className="mr-1" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white font-medium">{user.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <MapPin size={14} className="mr-1" /> {user.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.state === 'Inactivo' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {user.state}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1 flex items-center">
                          <Clock size={10} className="mr-1" /> {user.lastSeen}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((item) => (
            <div key={item.role} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <Shield size={24} />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  item.status === 'Revision' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                }`}>
                  {item.status}
                </span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">{item.role}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex-1">{item.scope}</p>
              
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{item.users} usuarios</span>
                  <span className="text-[10px] text-gray-500">{item.permissions} permisos</span>
                </div>
                <div className="flex space-x-1">
                  <button className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
