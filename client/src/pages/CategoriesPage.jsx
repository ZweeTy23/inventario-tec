import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Label, TextInput, Select } from 'flowbite-react'
import { api } from '../lib/api'
import { PERMISSIONS } from '../lib/constants'
import { formatDate } from '../lib/format'
import { usePermissions } from '../hooks/usePermissions'
import DataTable from '../components/ui/DataTable'
import Pagination from '../components/ui/Pagination'
import SearchBar from '../components/ui/SearchBar'
import ActionButtons from '../components/ui/ActionButtons'
import FormModal from '../components/ui/FormModal'
import PageError from '../components/ui/PageError'

export default function CategoriesPage() {
  const { hasPermission } = usePermissions()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', parentId: '' })

  const canCreate = hasPermission(PERMISSIONS.PRODUCTS_CREATE)
  const canUpdate = hasPermission(PERMISSIONS.PRODUCTS_UPDATE)
  const canDelete = hasPermission(PERMISSIONS.PRODUCTS_DELETE)

  async function fetchCategories() {
    try {
      setLoading(true)
      const response = await api.get('/categories?perPage=100')
      setCategories(response.data)
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las categorías.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  function openCreate() {
    setEditing(null)
    setForm({ name: '', parentId: '' })
    setShowModal(true)
  }

  function openEdit(category) {
    setEditing(category)
    setForm({ name: category.name, parentId: category.parentId ?? '' })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        name: form.name,
        parentId: form.parentId || null,
      }
      if (editing) {
        await api.patch(`/categories/${editing.id}`, payload)
      } else {
        await api.post('/categories', payload)
      }
      setShowModal(false)
      fetchCategories()
    } catch (err) {
      alert(err.message || 'Error al guardar categoría')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar esta categoría?')) return
    try {
      await api.delete(`/categories/${id}`)
      fetchCategories()
    } catch (err) {
      alert(err.message || 'Error al eliminar')
    }
  }

  const parentMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      render: (row) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white">{row.name}</span>
      ),
    },
    {
      key: 'parent',
      header: 'Categoría Padre',
      render: (row) => row.parentId ? (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
          {parentMap[row.parentId] ?? '—'}
        </span>
      ) : (
        <span className="text-xs text-gray-400 italic">Raíz</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Fecha Creación',
      render: (row) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'relative',
      render: (row) => (
        <ActionButtons
          onEdit={() => openEdit(row)}
          onDelete={() => handleDelete(row.id)}
          canEdit={canUpdate}
          canDelete={canDelete}
        />
      ),
    },
  ]

  if (error) return <PageError message={error} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar categorías..." />
        {canCreate && (
          <button
            onClick={openCreate}
            className="inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Nueva Categoría
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>

      <FormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Editar Categoría' : 'Nueva Categoría'}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="cat-name" value="Nombre" />
            <TextInput id="cat-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="cat-parent" value="Categoría Padre (opcional)" />
            <Select id="cat-parent" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
              <option value="">Ninguna (raíz)</option>
              {categories.filter((c) => c.id !== editing?.id).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
        </div>
      </FormModal>
    </div>
  )
}
