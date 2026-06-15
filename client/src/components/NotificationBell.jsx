import { useState, useEffect, useRef } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { api } from '../lib/api'
import { NOTIFICATION_TYPES } from '../lib/constants'
import { formatDateTime } from '../lib/format'
import { useAuth } from '../auth/AuthContext'
import StatusBadge from './ui/StatusBadge'

export default function NotificationBell() {
  const { hasAnyPermission } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const panelRef = useRef(null)

  const canView = hasAnyPermission('alerts.view')

  const unreadCount = notifications.filter((n) => !n.isRead).length

  async function fetchNotifications() {
    if (!canView) return
    try {
      setLoading(true)
      const response = await api.get('/notifications?perPage=20&onlyMine=true')
      setNotifications(response.data ?? [])
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (canView) fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [canView])

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function markRead(id) {
    try {
      await api.post(`/notifications/${id}/read`, {})
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch { /* ignore */ }
  }

  async function markAllRead() {
    try {
      await api.post('/notifications/read-all', {})
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch { /* ignore */ }
  }

  if (!canView) return null

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications() }}
        className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-xl transition-all relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 text-[9px] text-white font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notificaciones</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                <CheckCheck size={12} /> Marcar todas
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="p-4 text-sm text-gray-500 text-center">Cargando...</p>
            ) : notifications.length === 0 ? (
              <p className="p-8 text-sm text-gray-400 text-center">Sin notificaciones</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20 ${!n.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <StatusBadge
                        label={NOTIFICATION_TYPES[n.type] ?? n.type}
                        color={n.type === 'LOW_STOCK' ? 'amber' : n.type === 'APPROVAL_REQUIRED' ? 'indigo' : 'gray'}
                      />
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
                    </div>
                    {!n.isRead && (
                      <button onClick={() => markRead(n.id)} className="p-1 text-indigo-600 hover:bg-indigo-100 rounded shrink-0" title="Marcar como leída">
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
