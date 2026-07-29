import { useState } from 'react'
import { Eye, Shield, FileText } from 'lucide-react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'flowbite-react'
import { usePaginatedList } from '../hooks/usePaginatedList'
import { formatDateTime } from '../lib/format'
import DataTable from '../components/ui/DataTable'
import Pagination from '../components/ui/Pagination'
import StatusBadge from '../components/ui/StatusBadge'
import PageError from '../components/ui/PageError'

export default function AuditLogsPage() {
  const [selectedLog, setSelectedLog] = useState(null)
  const [actionFilter, setActionFilter] = useState('all')
  const [tableFilter, setTableFilter] = useState('all')

  const filters = {
    ...(actionFilter !== 'all' ? { action: actionFilter } : {}),
    ...(tableFilter !== 'all' ? { tableAffected: tableFilter } : {}),
  }

  const { items, meta, loading, error, page, setPage } = usePaginatedList('/audit-logs', { filters })

  const columns = [
    {
      key: 'createdAt',
      header: 'Fecha / Hora',
      render: (row) => <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{formatDateTime(row.createdAt)}</span>,
    },
    {
      key: 'user',
      header: 'Usuario',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center">
            {(row.user?.name?.[0] ?? 'S').toUpperCase()}
          </div>
          <span className="text-xs font-medium text-gray-900 dark:text-white">{row.user?.name ?? 'Sistema'}</span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Acción',
      render: (row) => {
        const isDelete = row.action.includes('DELETE') || row.action.includes('REJECT')
        const isCreate = row.action.includes('CREATE') || row.action.includes('APPROVE')
        const color = isDelete ? 'red' : isCreate ? 'green' : 'indigo'
        return <StatusBadge label={row.action} color={color} />
      },
    },
    {
      key: 'table',
      header: 'Tabla Afectada',
      render: (row) => <span className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{row.tableAffected}</span>,
    },
    {
      key: 'recordId',
      header: 'ID Registro',
      render: (row) => (
        <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 truncate max-w-[100px] inline-block" title={row.recordId}>
          {row.recordId ? `${row.recordId.slice(0, 8)}…` : '—'}
        </span>
      ),
    },
    {
      key: 'changes',
      header: 'Detalle de Cambios',
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedLog(row)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
        >
          <Eye size={14} /> Inspector JSON
        </button>
      ),
    },
  ]

  if (error) return <PageError message={error} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="text-indigo-600 dark:text-indigo-400" size={20} />
            <h2 className="text-lg font-black text-gray-900 dark:text-white">Bitácora de Auditoría del Sistema</h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Registro inmutable de trazabilidad de cambios, creación, modificación e inicios de sesión.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
            className="px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">Todas las Acciones</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="APPROVE">APPROVE</option>
            <option value="REJECT">REJECT</option>
            <option value="AUTO_APPROVE">AUTO_APPROVE</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={items} loading={loading} emptyMessage="No hay registros de auditoría que coincidan con la búsqueda." />
        <Pagination meta={meta} page={page} onPageChange={setPage} />
      </div>

      {/* JSON Inspector Modal */}
      {selectedLog && (
        <Modal show={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} size="lg">
          <ModalHeader>
            <div className="flex items-center gap-2">
              <FileText className="text-indigo-600" size={20} />
              <span>Inspector de Auditoría #{selectedLog.id.slice(0, 8)}</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>
                  <span className="text-gray-400 uppercase font-bold block text-[10px]">Acción Ejecutada</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase font-bold block text-[10px]">Tabla Afectada</span>
                  <span className="font-mono text-gray-900 dark:text-white">{selectedLog.tableAffected}</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase font-bold block text-[10px]">Usuario Responsable</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedLog.user?.name ?? 'Sistema'}</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase font-bold block text-[10px]">Fecha &amp; Hora</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatDateTime(selectedLog.createdAt)}</span>
                </div>
              </div>

              {selectedLog.oldData && (
                <div>
                  <span className="font-bold text-rose-600 uppercase text-[10px] block mb-1.5">Estado Previo (oldData)</span>
                  <pre className="p-3 bg-gray-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-40 border border-gray-800">
                    {JSON.stringify(selectedLog.oldData, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newData && (
                <div>
                  <span className="font-bold text-emerald-600 uppercase text-[10px] block mb-1.5">Nuevo Estado (newData)</span>
                  <pre className="p-3 bg-gray-900 text-cyan-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-40 border border-gray-800">
                    {JSON.stringify(selectedLog.newData, null, 2)}
                  </pre>
                </div>
              )}

              {!selectedLog.oldData && !selectedLog.newData && (
                <p className="text-gray-400 italic text-center py-4">No hay datos estructurados adjuntos a esta operación.</p>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="gray" onClick={() => setSelectedLog(null)}>Cerrar</Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  )
}
