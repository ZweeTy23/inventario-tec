export default function PageError({ message }) {
  return (
    <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
      {message}
    </div>
  )
}
