import { useState, useEffect } from 'react'
import { Plus, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Check, X } from 'lucide-react'
import { Label, TextInput, Select } from 'flowbite-react'
import { api } from '../lib/api'
import { PERMISSIONS, MOVEMENT_TYPES, MOVEMENT_STATUS } from '../lib/constants'
import { formatDateTime, formatCurrency } from '../lib/format'
import { usePermissions } from '../hooks/usePermissions'
import { usePaginatedList } from '../hooks/usePaginatedList'
import DataTable from '../components/ui/DataTable'
import Pagination from '../components/ui/Pagination'
import FormModal from '../components/ui/FormModal'
import StatusBadge from '../components/ui/StatusBadge'
import PageError from '../components/ui/PageError'

const emptyForm = {
  productId: '',
  movementType: 'PURCHASE_ENTRY',
  quantity: '',
  unitCost: '',
  sourceLocationId: '',
  destinationLocationId: '',
  batchNumber: '',
  expirationDate: '',
}

function MovementIcon({ type }) {
  const dir = MOVEMENT_TYPES[type]?.direction
  if (dir === 'in') return <ArrowDownLeft size={16} className="text-green-500" />
  if (dir === 'out') return <ArrowUpRight size={16} className="text-red-500" />
  return <ArrowLeftRight size={16} className="text-blue-500" />
}

export default function MovementsPage() {
  const { hasPermission } = usePermissions()
  const [products, setProducts] = useState([])
  const [locations, setLocations] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const canCreate = hasPermission(PERMISSIONS.MOVEMENTS_CREATE)
  const canApprove = hasPermission(PERMISSIONS.MOVEMENTS_APPROVE)

  const filters = statusFilter !== 'all' ? { status: statusFilter } : {}
  const { items, meta, loading, error, page, setPage, refresh } = usePaginatedList('/movements', { filters })

  function handleStatusFilter(value) {
    setStatusFilter(value)
    setPage(1)
  }

  useEffect(() => {
    async function loadRefs() {
      const [prodRes, locRes] = await Promise.all([
        api.get('/products?perPage=100'),
        api.get('/locations?perPage=100&locationType=LEVEL'),
      ])
      setProducts(prodRes.data)
      setLocations(locRes.data)
    }
    loadRefs()
  }, [])

  const movementType = form.movementType
  const isEntry = ['PURCHASE_ENTRY', 'RETURN_ENTRY'].includes(movementType)
  const isExit = ['SALE_EXIT', 'LOSS_EXIT', 'EXPIRED_EXIT'].includes(movementType)
  const isTransfer = movementType === 'TRANSFER'

  function openCreate() {
    setForm({
      ...emptyForm,
      productId: products[0]?.id ?? '',
      destinationLocationId: locations[0]?.id ?? '',
      sourceLocationId: locations[0]?.id ?? '',
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        productId: form.productId,
        movementType: form.movementType,
        quantity: Number(form.quantity),
        unitCost: Number(form.unitCost) || 0,
      }
      if (isEntry) payload.destinationLocationId = form.destinationLocationId
      if (isExit) payload.sourceLocationId = form.sourceLocationId
      if (isTransfer) {
        payload.sourceLocationId = form.sourceLocationId
        payload.destinationLocationId = form.destinationLocationId
      }
      await api.post('/movements', payload)
      setShowModal(false)
      refresh()
    } catch (err) {
      alert(err.message || 'Error al crear movimiento')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleApprove(id) {
    const batchNumber = window.prompt('Número de lote (opcional):') ?? undefined
    const expirationDate = window.prompt('Fecha de caducidad YYYY-MM-DD (opcional):') ?? undefined
    try {
      await api.post(`/movements/${id}/approve`, {
        ...(batchNumber ? { batchNumber } : {}),
        ...(expirationDate ? { expirationDate } : {}),
      })
      refresh()
    } catch (err) {
      alert(err.message || 'Error al aprobar')
    }
  }

  async function handleReject(id) {
    if (!window.confirm('¿Rechazar este movimiento?')) return
    try {
      await api.post(`/movements/${id}/reject`, {})
      refresh()
    } catch (err) {
      alert(err.message || 'Error al rechazar')
    }
  }

  const columns = [
    {
      key: 'type',
      header: 'Tipo',
      render: (row) => (
        <div className="flex items-center gap-2">
          <MovementIcon type={row.movementType} />
          <span className="text-sm">{MOVEMENT_TYPES[row.movementType]?.label ?? row.movementType}</span>
        </div>
      ),
    },
    {
      key: 'product',
      header: 'Producto',
      render: (row) => (
        <div>
          <div className="text-sm font-medium">{row.product?.name}</div>
          <div className="text-xs text-gray-500">{row.quantity} uds · {formatCurrency(row.unitCost)}/ud</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (row) => {
        const s = MOVEMENT_STATUS[row.status]
        return <StatusBadge label={s?.label ?? row.status} color={s?.color ?? 'gray'} />
      },
    },
    {
      key: 'user',
      header: 'Usuario',
      render: (row) => <span className="text-sm">{row.user?.name ?? '—'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (row) => <span className="text-xs text-gray-500">{formatDateTime(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => row.status === 'PENDING' && canApprove && (
        <div className="flex gap-2">
          <button onClick={() => handleApprove(row.id)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Aprobar">
            <Check size={16} />
          </button>
          <button onClick={() => handleReject(row.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Rechazar">
            <X size={16} />
          </button>
        </div>
      ),
    },
  ]

  if (error) return <PageError message={error} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
        >
          <option value="all">Todos los estados</option>
          {Object.entries(MOVEMENT_STATUS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        {canCreate && (
          <button onClick={openCreate} className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Nuevo Movimiento
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
        title="Registrar Movimiento"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Label value="Tipo de movimiento" />
            <Select value={form.movementType} onChange={(e) => setForm({ ...form, movementType: e.target.value })}>
              {Object.entries(MOVEMENT_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label value="Producto" />
            <Select required value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label value="Cantidad" /><TextInput type="number" min="1" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
            <div><Label value="Costo unitario" /><TextInput type="number" step="0.01" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} /></div>
          </div>
          {(isEntry || isTransfer) && (
            <div>
              <Label value="Ubicación destino" />
              <Select required value={form.destinationLocationId} onChange={(e) => setForm({ ...form, destinationLocationId: e.target.value })}>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </Select>
            </div>
          )}
          {(isExit || isTransfer) && (
            <div>
              <Label value="Ubicación origen" />
              <Select required value={form.sourceLocationId} onChange={(e) => setForm({ ...form, sourceLocationId: e.target.value })}>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </Select>
            </div>
          )}
        </div>
      </FormModal>
    </div>
  )
}
