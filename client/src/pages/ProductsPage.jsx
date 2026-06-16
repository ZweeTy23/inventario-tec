import { useState, useEffect } from 'react'
import { Plus, Package, AlertTriangle } from 'lucide-react'
import { Label, TextInput, Select } from 'flowbite-react'
import { api } from '../lib/api'
import { PERMISSIONS } from '../lib/constants'
import { formatCurrency } from '../lib/format'
import { usePermissions } from '../hooks/usePermissions'
import { usePaginatedList } from '../hooks/usePaginatedList'
import DataTable from '../components/ui/DataTable'
import Pagination from '../components/ui/Pagination'
import SearchBar from '../components/ui/SearchBar'
import ActionButtons from '../components/ui/ActionButtons'
import FormModal from '../components/ui/FormModal'
import PageError from '../components/ui/PageError'

const emptyProduct = {
  name: '', sku: '', categoryId: '', supplierId: '', basePrice: '', minStockAlert: '5',
}

export default function ProductsPage() {
  const { hasPermission } = usePermissions()
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState(emptyProduct)

  const canCreate = hasPermission(PERMISSIONS.PRODUCTS_CREATE)
  const canUpdate = hasPermission(PERMISSIONS.PRODUCTS_UPDATE)
  const canDelete = hasPermission(PERMISSIONS.PRODUCTS_DELETE)

  const { items, meta, loading, error, page, setPage, search, setSearch, refresh } = usePaginatedList('/products', {
    filters: selectedCategory !== 'all' ? { categoryId: selectedCategory } : {},
  })

  useEffect(() => {
    async function loadRefs() {
      const [catRes, suppRes] = await Promise.all([
        api.get('/categories?perPage=100'),
        api.get('/suppliers?perPage=100'),
      ])
      setCategories(catRes.data)
      setSuppliers(suppRes.data)
    }
    loadRefs()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm({
      ...emptyProduct,
      categoryId: categories[0]?.id ?? '',
      supplierId: suppliers[0]?.id ?? '',
    })
    setShowModal(true)
  }

  function openEdit(product) {
    setEditing(product)
    setForm({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      basePrice: String(product.basePrice),
      minStockAlert: String(product.minStockAlert),
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        categoryId: form.categoryId,
        supplierId: form.supplierId,
        basePrice: Number(form.basePrice),
        minStockAlert: Number(form.minStockAlert),
      }
      if (editing) {
        await api.patch(`/products/${editing.id}`, payload)
      } else {
        await api.post('/products', payload)
      }
      setShowModal(false)
      refresh()
    } catch (err) {
      alert(err.message || 'Error al guardar producto')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este producto?')) return
    try {
      await api.delete(`/products/${id}`)
      refresh()
    } catch (err) {
      alert(err.message || 'Error al eliminar')
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Producto / SKU',
      render: (row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500">
            <Package size={20} />
          </div>
          <div className="ml-4">
            <div className="text-sm font-bold text-gray-900 dark:text-white">{row.name}</div>
            <div className="text-xs text-gray-500 font-mono uppercase">{row.sku}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoría & Proveedor',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-900 dark:text-white">{row.category?.name ?? '—'}</span>
          <span className="text-[10px] text-gray-500">{row.supplier?.name ?? '—'}</span>
        </div>
      ),
    },
    {
      key: 'basePrice',
      header: 'Precio Base',
      render: (row) => <span className="text-sm font-bold">{formatCurrency(row.basePrice)}</span>,
    },
    {
      key: 'minStockAlert',
      header: 'Alerta Stock',
      render: (row) => (
        <div className="flex items-center text-xs text-gray-500">
          Mín: {row.minStockAlert}
          {row._count?.stockLevels <= row.minStockAlert && row._count?.stockLevels > 0 && (
            <AlertTriangle size={12} className="ml-2 text-amber-500" />
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar por nombre o SKU..." className="max-w-none flex-1" />
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1) }}
            className="block w-full sm:w-48 px-3 py-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        {canCreate && (
          <button onClick={openCreate} className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Nuevo Producto
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={items} loading={loading} />
        <Pagination meta={meta} page={page} onPageChange={setPage} />
      </div>

      <FormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Editar Producto' : 'Nuevo Producto'}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div><Label>Nombre</Label><TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>SKU</Label><TextInput required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} disabled={Boolean(editing)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Precio Base</Label><TextInput type="number" step="0.01" required value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} /></div>
            <div><Label>Alerta Stock Mín.</Label><TextInput type="number" required value={form.minStockAlert} onChange={(e) => setForm({ ...form, minStockAlert: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Categoría</Label>
              <Select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Proveedor</Label>
              <Select required value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                {suppliers.map((sup) => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
              </Select>
            </div>
          </div>
        </div>
      </FormModal>
    </div>
  )
}
