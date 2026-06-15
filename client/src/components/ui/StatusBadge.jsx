const COLORS = {
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
}

export default function StatusBadge({ label, color = 'gray' }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${COLORS[color] ?? COLORS.gray}`}>
      {label}
    </span>
  )
}
