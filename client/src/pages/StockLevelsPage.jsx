import { useState } from 'react'
import { Package, MapPin } from 'lucide-react'
import { Label, TextInput } from 'flowbite-react'
import { api } from '../lib/api'
import { PERMISSIONS } from '../lib/constants'
import { formatDate } from '../lib/format'
import { usePermissions } from '../hooks/usePermissions'
import { usePaginatedList } from '../hooks/usePaginatedList'
import DataTable from '../components/ui/DataTable'
import Pagination from '../components/ui/Pagination'
import FormModal from '../components/ui/FormModal'
import StatusBadge from '../components/ui/StatusBadge'
import PageError from '../components/ui/PageError'

export default function StockLevelsPage() {
  const { hasPermission } = usePermissions()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ quantity: '', expirationDate: '' })

  const canUpdate = hasPermission(PERMISSIONS.INVENTORY_UPDATE)

  const { items, meta, loading, error, page, setPage, refresh } = usePaginatedList('/stock-levels')

  function openAdjust(stock) {
    setEditing(stock)
    setForm({
      quantity: String(stock.quantity),
      expirationDate: stock.expirationDate ? stock.expirationDate.split('T')[0] : '',
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.patch(`/stock-levels/${editing.id}`, {
        quantity: Number(form.quantity),
        expirationDate: form.expirationDate || null,
      })
      setShowModal(false)
      refresh()
    } catch (err) {
      alert(err.message || 'Error al ajustar stock')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'product',
      header: 'Producto',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Package size={16} className="text-indigo-500" />
          <div>
            <div className="text-sm font-medium">{row.product?.name ?? '—'}</div>
            <div className="text-xs text-gray-500 font-mono">{row.product?.sku}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Ubicación',
      render: (row) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin size={14} /> {row.location?.name ?? '—'}
        </div>
      ),
    },
    {
      key: 'batchNumber',
      header: 'Lote',
      render: (row) => <span className="text-xs font-mono">{row.batchNumber}</span>,
    },
    {
      key: 'quantity',
      header: 'Cantidad',
      render: (row) => (
        <span className={`text-sm font-bold ${row.quantity <= (row.product?.minStockAlert ?? 0) ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>
          {row.quantity}
        </span>
      ),
    },
    {
      key: 'expirationDate',
      header: 'Caducidad',
      render: (row) => {
        if (!row.expirationDate) return <span className="text-xs text-gray-400">—</span>
        const exp = new Date(row.expirationDate)
        const daysLeft = Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24))
        return (
          <div>
            <span className="text-sm">{formatDate(row.expirationDate)}</span>
            {daysLeft <= 30 && daysLeft >= 0 && (
              <StatusBadge label={`${daysLeft}d restantes`} color="amber" />
            )}
            {daysLeft < 0 && <StatusBadge label="Caducado" color="red" />}
          </div>
        )
      },
    },
    {
      key: 'actions',
      header: '',
      render: (row) => canUpdate && (
        <button onClick={() => openAdjust(row)} className="text-xs text-indigo-600 hover:underline">
          Ajustar
        </button>
      ),
    },
  ]

  if (error) return <PageError message={error} />

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={items} loading={loading} emptyMessage="No hay niveles de stock registrados." />
        <Pagination meta={meta} page={page} onPageChange={setPage} />
      </div>

      <FormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Ajustar Stock"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Aplicar ajuste"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {editing?.product?.name} — Lote {editing?.batchNumber}
          </p>
          <div><Label>Cantidad</Label><TextInput type="number" min="0" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
          <div><Label>Fecha de caducidad</Label><TextInput type="date" value={form.expirationDate} onChange={(e) => setForm({ ...form, expirationDate: e.target.value })} /></div>
        </div>
      </FormModal>
    </div>
  )
}
