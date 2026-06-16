import { useState, useEffect } from 'react'
import { Plus, Truck, Mail, Phone, Globe } from 'lucide-react'
import { Label, TextInput } from 'flowbite-react'
import { api } from '../lib/api'
import { PERMISSIONS } from '../lib/constants'
import { usePermissions } from '../hooks/usePermissions'
import SearchBar from '../components/ui/SearchBar'
import FormModal from '../components/ui/FormModal'
import PageError from '../components/ui/PageError'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  contactPerson: '',
  reliabilityScore: '80',
}

export default function SuppliersPage() {
  const { hasPermission } = usePermissions()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const canCreate = hasPermission(PERMISSIONS.PRODUCTS_CREATE)
  const canUpdate = hasPermission(PERMISSIONS.PRODUCTS_UPDATE)
  const canDelete = hasPermission(PERMISSIONS.PRODUCTS_DELETE)

  async function fetchSuppliers() {
    try {
      setLoading(true)
      const response = await api.get('/suppliers?perPage=100')
      setSuppliers(response.data)
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los proveedores.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSuppliers() }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEdit(supplier) {
    const info = supplier.contactInfo ?? {}
    setEditing(supplier)
    setForm({
      name: supplier.name,
      email: info.email ?? '',
      phone: info.phone ?? '',
      address: info.address ?? '',
      contactPerson: info.contactPerson ?? '',
      reliabilityScore: String(supplier.reliabilityScore ?? 0),
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        name: form.name,
        reliabilityScore: Number(form.reliabilityScore),
        contactInfo: {
          email: form.email || undefined,
          phone: form.phone || undefined,
          address: form.address || undefined,
          contactPerson: form.contactPerson || undefined,
        },
      }
      if (editing) {
        await api.patch(`/suppliers/${editing.id}`, payload)
      } else {
        await api.post('/suppliers', payload)
      }
      setShowModal(false)
      fetchSuppliers()
    } catch (err) {
      alert(err.message || 'Error al guardar proveedor')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este proveedor?')) return
    try {
      await api.delete(`/suppliers/${id}`)
      fetchSuppliers()
    } catch (err) {
      alert(err.message || 'Error al eliminar')
    }
  }

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (error) return <PageError message={error} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar proveedores..." />
        {canCreate && (
          <button onClick={openCreate} className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Nuevo Proveedor
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando proveedores...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((supplier) => {
            const info = supplier.contactInfo ?? {}
            return (
              <div key={supplier.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">
                      <Truck size={24} />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{supplier.name}</h3>
                      {info.address && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Globe size={12} className="mr-1" /> {info.address}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-indigo-600">{Number(supplier.reliabilityScore).toFixed(0)}%</div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Fiabilidad</div>
                  </div>
                </div>
                <div className="space-y-2 flex-1 text-sm text-gray-600 dark:text-gray-300">
                  {info.email && <div className="flex items-center"><Mail size={16} className="mr-2 text-gray-400" />{info.email}</div>}
                  {info.phone && <div className="flex items-center"><Phone size={16} className="mr-2 text-gray-400" />{info.phone}</div>}
                  {info.contactPerson && <div className="text-xs text-gray-500">Contacto: {info.contactPerson}</div>}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                  {canUpdate && (
                    <button onClick={() => openEdit(supplier)} className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                      Editar
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(supplier.id)} className="px-3 py-1.5 rounded-md text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100">
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed rounded-xl">
              No se encontraron proveedores.
            </div>
          )}
        </div>
      )}

      <FormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div><Label value="Nombre" /><TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label value="Persona de contacto" /><TextInput value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label value="Email" /><TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label value="Teléfono" /><TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div><Label value="Dirección" /><TextInput value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div><Label value="Score de fiabilidad (0-100)" /><TextInput type="number" min="0" max="100" value={form.reliabilityScore} onChange={(e) => setForm({ ...form, reliabilityScore: e.target.value })} /></div>
        </div>
      </FormModal>
    </div>
  )
}
