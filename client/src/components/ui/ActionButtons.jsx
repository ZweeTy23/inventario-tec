import { Edit2, Trash2 } from 'lucide-react'

export default function ActionButtons({ onEdit, onDelete, canEdit = true, canDelete = true }) {
  if (!canEdit && !canDelete) return null

  return (
    <div className="flex items-center justify-end space-x-2">
      {canEdit && onEdit && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-gray-50 dark:bg-gray-700/50 rounded-md"
        >
          <Edit2 size={16} />
        </button>
      )}
      {canDelete && onDelete && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors bg-gray-50 dark:bg-gray-700/50 rounded-md"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  )
}
