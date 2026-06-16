import { usePaginatedList } from '../hooks/usePaginatedList'
import { formatDateTime } from '../lib/format'
import DataTable from '../components/ui/DataTable'
import Pagination from '../components/ui/Pagination'
import PageError from '../components/ui/PageError'

export default function AuditLogsPage() {
  const { items, meta, loading, error, page, setPage } = usePaginatedList('/audit-logs')

  const columns = [
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (row) => <span className="text-xs text-gray-500">{formatDateTime(row.createdAt)}</span>,
    },
    {
      key: 'user',
      header: 'Usuario',
      render: (row) => <span className="text-sm font-medium">{row.user?.name ?? 'Sistema'}</span>,
    },
    {
      key: 'action',
      header: 'Acción',
      render: (row) => <span className="text-sm">{row.action}</span>,
    },
    {
      key: 'table',
      header: 'Tabla',
      render: (row) => <span className="text-xs font-mono text-gray-500">{row.tableAffected}</span>,
    },
    {
      key: 'recordId',
      header: 'Registro',
      render: (row) => (
        <span className="text-xs font-mono text-indigo-600 truncate max-w-[120px] inline-block">
          {row.recordId?.slice(0, 8)}…
        </span>
      ),
    },
    {
      key: 'changes',
      header: 'Cambios',
      render: (row) => (
        <div className="text-xs text-gray-500 max-w-xs truncate">
          {row.oldData && row.newData ? 'Modificación registrada' : row.newData ? 'Creación' : '—'}
        </div>
      ),
    },
  ]

  if (error) return <PageError message={error} />

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Bitácora de auditoría: registra quién, cuándo y qué cambios se realizaron en el sistema.
      </p>
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={items} loading={loading} emptyMessage="No hay registros de auditoría." />
        <Pagination meta={meta} page={page} onPageChange={setPage} />
      </div>
    </div>
  )
}
