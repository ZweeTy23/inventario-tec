import { useState, useEffect } from 'react'
import { Plus, Shield, Mail, CheckCircle2, XCircle } from 'lucide-react'
import { Label, TextInput, Select } from 'flowbite-react'
import { api } from '../lib/api'
import { PERMISSIONS, ROLE_LABELS } from '../lib/constants'
import { usePermissions } from '../hooks/usePermissions'
import DataTable from '../components/ui/DataTable'
import SearchBar from '../components/ui/SearchBar'
import FormModal from '../components/ui/FormModal'
import StatusBadge from '../components/ui/StatusBadge'
import PageError from '../components/ui/PageError'

const emptyUser = { name: '', email: '', password: '', roleId: '', isActive: true }

export default function UsersRolesPage() {
  const { hasPermission } = usePermissions()
  const [activeTab, setActiveTab] = useState('usuarios')
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState(emptyUser)

  const canManage = hasPermission(PERMISSIONS.USERS_MANAGE)

  async function fetchData() {
    try {
      setLoading(true)
      const [usersRes, rolesRes, permsRes] = await Promise.all([
        canManage ? api.get('/users?perPage=100') : Promise.resolve({ data: [] }),
        api.get('/roles'),
        api.get('/permissions'),
      ])
      setUsers(usersRes.data ?? [])
      setRoles(rolesRes.data ?? [])
      const grouped = permsRes.data ?? {}
      setPermissions(
        Object.entries(grouped).map(([module, perms]) => ({ module, permissions: perms }))
      )
    } catch (err) {
      setError(err.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [canManage])

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyUser, roleId: roles[0]?.id ?? '' })
    setShowModal(true)
  }

  function openEdit(user) {
    setEditing(user)
    setForm({ name: user.name, email: user.email, password: '', roleId: user.roleId, isActive: user.isActive })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = { name: form.name, email: form.email, roleId: form.roleId, isActive: form.isActive }
      if (form.password) payload.password = form.password
      if (editing) {
        await api.patch(`/users/${editing.id}`, payload)
      } else {
        if (!form.password) { alert('La contraseña es requerida'); return }
        await api.post('/users', { ...payload, password: form.password })
      }
      setShowModal(false)
      fetchData()
    } catch (err) {
      alert(err.message || 'Error al guardar usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Desactivar/eliminar este usuario?')) return
    try {
      await api.delete(`/users/${id}`)
      fetchData()
    } catch (err) {
      alert(err.message || 'Error al eliminar')
    }
  }

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const userColumns = [
    {
      key: 'name',
      header: 'Perfil',
      render: (row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
            {row.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="ml-4">
            <div className="text-sm font-bold text-gray-900 dark:text-white">{row.name}</div>
            <div className="text-xs text-gray-500 flex items-center"><Mail size={12} className="mr-1" />{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      render: (row) => (
        <span className="text-sm font-medium">{ROLE_LABELS[row.role?.name] ?? row.role?.name ?? '—'}</span>
      ),
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (row) => (
        <StatusBadge
          label={row.isActive ? 'Activo' : 'Inactivo'}
          color={row.isActive ? 'green' : 'gray'}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => canManage && (
        <div className="flex justify-end gap-2">
          <button onClick={() => openEdit(row)} className="text-xs text-indigo-600 hover:underline">Editar</button>
          <button onClick={() => handleDelete(row.id)} className="text-xs text-red-600 hover:underline">Eliminar</button>
        </div>
      ),
    },
  ]

  if (error) return <PageError message={error} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
        <div className="flex space-x-8">
          {['usuarios', 'roles'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold transition-colors relative ${
                activeTab === tab ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'usuarios' ? 'Usuarios' : 'Roles y Permisos'}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600" />}
            </button>
          ))}
        </div>
        {canManage && activeTab === 'usuarios' && (
          <button onClick={openCreate} className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg mb-4 sm:mb-0">
            <Plus size={18} className="mr-2" />
            Nuevo Usuario
          </button>
        )}
      </div>

      {activeTab === 'usuarios' ? (
        <div className="space-y-4">
          {canManage && <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar usuarios..." />}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {canManage ? (
              <DataTable columns={userColumns} data={filteredUsers} loading={loading} emptyMessage="No hay usuarios registrados." />
            ) : (
              <div className="p-8 text-center text-gray-500">No tienes permiso para gestionar usuarios.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => {
            const rolePerms = (role.rolePermissions ?? []).map((rp) => rp.permission)
            return (
              <div key={role.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600"><Shield size={24} /></div>
                  <StatusBadge label="Activo" color="green" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{ROLE_LABELS[role.name] ?? role.name}</h4>
                <p className="text-sm text-gray-500 mt-2">{role.description ?? 'Sin descripción'}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{rolePerms.length} permisos</span>
                  <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {rolePerms.map((p) => (
                      <li key={p.id} className="text-[10px] text-gray-500 flex items-center">
                        <CheckCircle2 size={10} className="mr-1 text-green-500" /> {p.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {permissions.length > 0 && activeTab === 'roles' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Permisos del sistema ({permissions.reduce((acc, g) => acc + g.permissions.length, 0)})</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {permissions.map((group) => (
              <div key={group.module} className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-xs font-bold uppercase text-indigo-600 mb-2">{group.module}</h4>
                <ul className="space-y-1">
                  {group.permissions.map((p) => (
                    <li key={p.id} className="text-xs text-gray-600 dark:text-gray-400">{p.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <FormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Editar Usuario' : 'Nuevo Usuario'}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div><Label>Nombre</Label><TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Email</Label><TextInput type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div>
            <Label>{editing ? 'Nueva contraseña (opcional)' : 'Contraseña'}</Label>
            <TextInput type="password" required={!editing} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <Label>Rol</Label>
            <Select required value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
              {roles.map((r) => <option key={r.id} value={r.id}>{ROLE_LABELS[r.name] ?? r.name}</option>)}
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Usuario activo
          </label>
        </div>
      </FormModal>
    </div>
  )
}
