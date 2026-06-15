export default function Pagination({ meta, page, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Mostrando página <span className="font-bold">{meta.page}</span> de{' '}
        <span className="font-bold">{meta.totalPages}</span> ({meta.total} registros)
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= meta.totalPages}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
