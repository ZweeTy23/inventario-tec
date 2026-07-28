import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  AlertCircle,
  Package,
  RefreshCcw,
  Plus,
  Clock,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Calendar,
  Layers,
  PieChart,
  ShieldAlert,
} from 'lucide-react'
import { Badge, Progress } from 'flowbite-react'
import { api } from '../lib/api'
import { formatCurrency, formatDateTime, formatDate } from '../lib/format'
import { MOVEMENT_TYPES } from '../lib/constants'

const directionStyle = {
  in: { dot: 'bg-emerald-500', icon: ArrowDownLeft, color: 'text-emerald-500' },
  out: { dot: 'bg-rose-500', icon: ArrowUpRight, color: 'text-rose-500' },
  transfer: { dot: 'bg-amber-500', icon: ArrowLeftRight, color: 'text-amber-500' },
}

const KPI_COLOR_MAPS = {
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    ring: 'ring-indigo-100 dark:ring-indigo-900/30',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-100 dark:ring-emerald-900/30',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-100 dark:ring-amber-900/30',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-100 dark:ring-blue-900/30',
  },
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/dashboard/stats')
      setStats(res.data)
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los datos del panel operativo')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const kpis = [
    {
      label: 'Valor total inventario',
      value: stats?.kpis ? formatCurrency(stats.kpis.totalValue) : '—',
      icon: BarChart3,
      colorKey: 'indigo',
    },
    {
      label: 'Productos activos',
      value: stats?.kpis ? stats.kpis.totalProducts.toLocaleString() : '—',
      icon: Package,
      colorKey: 'emerald',
    },
    {
      label: 'Stock bajo / Crítico',
      value: stats?.kpis ? String(stats.kpis.lowStockCount) : '—',
      icon: AlertCircle,
      colorKey: 'amber',
    },
    {
      label: 'Movimientos (total)',
      value: stats?.kpis ? stats.kpis.totalMovements.toLocaleString() : '—',
      icon: RefreshCcw,
      colorKey: 'blue',
    },
  ]

  const lowStockRows = stats?.lowStockProducts ?? []
  const recentMovements = stats?.recentMovements ?? []
  const abc = stats?.abcAnalysis
  const expiration = stats?.expirationSummary
  const categoryDist = stats?.categoryDistribution ?? []
  const movementTrends = stats?.movementTrends ?? []

  // Max daily movement quantity for trend bar chart scaling
  const maxTrendQty = Math.max(
    1,
    ...movementTrends.map((d) => d.entries + d.exits + d.transfers)
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Monitoreo en Tiempo Real
            </span>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Panel Operativo de <span className="text-indigo-600">Inventario TEC</span>
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-xl text-lg font-medium">
            {stats?.kpis
              ? <>Inventario valorado en <span className="text-gray-900 dark:text-white font-bold">{formatCurrency(stats.kpis.totalValue)}</span> con <span className="text-gray-900 dark:text-white font-bold">{stats.kpis.totalUnits.toLocaleString()} unidades</span> en almacén.</>
              : 'Cargando indicadores del almacén...'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Badge color="indigo" size="sm" className="px-3 py-1 rounded-full uppercase font-black tracking-widest">Sistema Sincronizado</Badge>
            {stats?.kpis && stats.kpis.lowStockCount > 0 && (
              <Badge color="warning" size="sm" className="px-3 py-1 rounded-full uppercase font-black tracking-widest">
                {stats.kpis.lowStockCount} Alertas de Stock
              </Badge>
            )}
            {expiration && (expiration.expiredCount > 0 || expiration.expiringSoonCount > 0) && (
              <Badge color="failure" size="sm" className="px-3 py-1 rounded-full uppercase font-black tracking-widest">
                {expiration.expiredCount + expiration.expiringSoonCount} Alertas Caducidad
              </Badge>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3 relative z-10">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center rounded-2xl border-2 border-gray-200 dark:border-gray-700 font-bold px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refrescar
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/movimientos')}
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none font-bold px-5 py-2.5 transition-colors"
          >
            <Plus className="mr-2 h-5 w-5" /> Nueva Operación
          </button>
        </div>

        {/* Ambient Decor */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900 px-6 py-4 text-sm font-semibold text-red-600 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={load} className="underline text-xs font-bold uppercase">Reintentar</button>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const colors = KPI_COLOR_MAPS[kpi.colorKey] || KPI_COLOR_MAPS.indigo
          return (
            <div key={kpi.label} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <div className={`p-3.5 rounded-2xl ${colors.bg} ${colors.text} group-hover:scale-110 transition-transform`}>
                  <kpi.icon size={24} />
                </div>
              </div>
              <div className="mt-6">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{kpi.label}</p>
                <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-1 tracking-tight">{kpi.value}</h4>
              </div>
            </div>
          )
        })}
      </div>

      {/* ABC Analysis Section */}
      {abc && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <PieChart className="text-indigo-600 dark:text-indigo-400" size={20} />
                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Análisis ABC de Inventario</h3>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">Clasificación Pareto según valor acumulado</p>
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl">
              Valor Total: {formatCurrency(stats.kpis?.totalValue ?? 0)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category A */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-5">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs">Clase A (80% Valor)</span>
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">{abc.A.percentage}% del total</span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(abc.A.totalValue)}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{abc.A.count} productos de alta rotación / costo</p>
              </div>
              <div className="mt-4">
                <Progress progress={abc.A.percentage} color="green" size="sm" className="rounded-full" />
              </div>
            </div>

            {/* Category B */}
            <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-5">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-black text-xs">Clase B (15% Valor)</span>
                <span className="text-xs font-black text-blue-700 dark:text-blue-400">{abc.B.percentage}% del total</span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(abc.B.totalValue)}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{abc.B.count} productos de impacto medio</p>
              </div>
              <div className="mt-4">
                <Progress progress={abc.B.percentage} color="blue" size="sm" className="rounded-full" />
              </div>
            </div>

            {/* Category C */}
            <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-2xl p-5">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-black text-xs">Clase C (5% Valor)</span>
                <span className="text-xs font-black text-purple-700 dark:text-purple-400">{abc.C.percentage}% del total</span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(abc.C.totalValue)}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{abc.C.count} productos de menor costo relativo</p>
              </div>
              <div className="mt-4">
                <Progress progress={abc.C.percentage} color="purple" size="sm" className="rounded-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 30-Day Movement Trend Chart */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="text-indigo-600 dark:text-indigo-400" size={20} />
              <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Tendencia de Movimientos (Últimos 30 Días)</h3>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">Volumen diario de entradas, salidas y transferencias</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Entradas</span>
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Salidas</span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Transferencias</span>
          </div>
        </div>

        {movementTrends.length === 0 ? (
          <p className="text-center py-10 text-sm text-gray-400">Sin datos de tendencia en el período.</p>
        ) : (
          <div className="space-y-3">
            <div className="h-44 flex items-end gap-1.5 pt-4 pb-2 px-2 overflow-x-auto border-b border-gray-100 dark:border-gray-800">
              {movementTrends.map((d) => {
                const totalDay = d.entries + d.exits + d.transfers
                const heightPercent = totalDay > 0 ? Math.max(8, Math.round((totalDay / maxTrendQty) * 100)) : 4
                return (
                  <div key={d.date} className="flex-1 min-w-[12px] flex flex-col items-center group relative">
                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-gray-900 text-white text-[10px] p-2 rounded-lg shadow-xl z-30 whitespace-nowrap pointer-events-none">
                      <span className="font-bold border-b border-gray-700 pb-1 mb-1">{d.date}</span>
                      <span className="text-emerald-400">Entradas: {d.entries}</span>
                      <span className="text-rose-400">Salidas: {d.exits}</span>
                      <span className="text-amber-400">Transf: {d.transfers}</span>
                    </div>
                    {/* Visual Stacked Bar */}
                    <div
                      className="w-full rounded-t transition-all group-hover:brightness-110 flex flex-col justify-end overflow-hidden bg-gray-100 dark:bg-gray-800"
                      style={{ height: `${heightPercent}%` }}
                    >
                      {d.entries > 0 && <div style={{ height: `${(d.entries / (totalDay || 1)) * 100}%` }} className="bg-emerald-500" />}
                      {d.exits > 0 && <div style={{ height: `${(d.exits / (totalDay || 1)) * 100}%` }} className="bg-rose-500" />}
                      {d.transfers > 0 && <div style={{ height: `${(d.transfers / (totalDay || 1)) * 100}%` }} className="bg-amber-500" />}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
              <span>{movementTrends[0]?.date}</span>
              <span>{movementTrends[Math.floor(movementTrends.length / 2)]?.date}</span>
              <span>{movementTrends[movementTrends.length - 1]?.date}</span>
            </div>
          </div>
        )}
      </div>

      {/* Expiration Summary & Perishables Alert Panel */}
      {expiration && (expiration.expiredCount > 0 || expiration.expiringSoonCount > 0 || expiration.criticalItems.length > 0) && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-amber-50/30 dark:bg-amber-950/10">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="text-amber-600 dark:text-amber-400" size={20} />
                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Control de Caducidad y Perecederos</h3>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">Alertas de lotes próximos a vencer o ya expirados</p>
            </div>
            <div className="flex gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-bold">
                Expirados: {expiration.expiredCount} uds ({formatCurrency(expiration.expiredValue)})
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold">
                Por vencer (&lt;30d): {expiration.expiringSoonCount} uds ({formatCurrency(expiration.expiringSoonValue)})
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Producto / SKU</th>
                  <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lote &amp; Ubicación</th>
                  <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Cantidad</th>
                  <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha Caducidad</th>
                  <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-xs">
                {expiration.criticalItems.map((item, idx) => {
                  const isExpired = item.status === 'EXPIRED'
                  return (
                    <tr key={`${item.productId}-${item.batchNumber}-${idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {item.productName} <span className="font-mono text-gray-400 font-normal ml-1">({item.sku})</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-[11px]">{item.batchNumber}</span>
                        <span className="ml-2 text-gray-500 dark:text-gray-400">{item.locationName}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold">{item.quantity} uds</td>
                      <td className="px-6 py-4 font-medium">{formatDate(item.expirationDate)}</td>
                      <td className="px-6 py-4 text-right">
                        <Badge
                          color={isExpired ? 'failure' : 'warning'}
                          className="inline-flex rounded-lg px-2 py-0.5 font-black uppercase text-[10px]"
                        >
                          {isExpired ? 'Expirado' : 'Por Vencer'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Grid: Activity Feed, Category Distribution, Critical Products */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="xl:col-span-1 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Actividad Reciente</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Últimos movimientos registrados</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/app/movimientos')}
              className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 uppercase tracking-widest rounded-xl px-3 py-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            >
              Ver Todo
            </button>
          </div>
          <div className="p-6 flex-1 space-y-6">
            {loading && recentMovements.length === 0 && (
              <p className="text-sm text-gray-400 font-medium">Cargando movimientos...</p>
            )}
            {!loading && recentMovements.length === 0 && (
              <p className="text-sm text-gray-400 font-medium">Aún no hay movimientos registrados.</p>
            )}
            {recentMovements.map((m) => {
              const meta = MOVEMENT_TYPES[m.movementType]
              const style = directionStyle[meta?.direction] ?? directionStyle.transfer
              return (
                <div key={m.id} className="flex items-start group">
                  <div className={`mt-1 w-1.5 h-8 rounded-full shrink-0 ${style.dot} group-hover:h-10 transition-all duration-300`}></div>
                  <div className="ml-5 flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight leading-none truncate">{meta?.label ?? m.movementType}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center shrink-0 ml-2">
                        <Clock size={10} className="mr-1" /> {formatDateTime(m.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed truncate">
                      {m.quantity} uds de <span className="font-bold text-gray-700 dark:text-gray-300">{m.product?.name ?? 'producto'}</span>
                    </p>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase mt-1">
                      Operador: {m.user?.name ?? 'Sistema'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Critical Products & Category Distribution */}
        <div className="xl:col-span-2 space-y-8">
          {/* Critical Products Table */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Productos Críticos</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Prioridad de reabastecimiento</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/app/stock')}
                className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 uppercase tracking-widest flex items-center rounded-xl px-3 py-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                Gestionar Stock <ArrowRight size={14} className="ml-2" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Información del Producto</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Nivel de Stock</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {lowStockRows.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-sm font-medium text-gray-400">
                        {loading ? 'Cargando...' : 'No hay productos por debajo del stock mínimo.'}
                      </td>
                    </tr>
                  )}
                  {lowStockRows.map((row) => {
                    const min = row.minStockAlert || 0
                    const progress = min > 0 ? Math.min(100, Math.round((row.onHand / min) * 100)) : 0
                    const critical = min > 0 && row.onHand <= min / 2
                    return (
                      <tr key={row.id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                              <Package size={20} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-black text-gray-900 dark:text-white tracking-tight leading-none">{row.name}</div>
                              <div className="text-[10px] font-bold text-gray-400 font-mono uppercase mt-1.5">{row.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 min-w-[180px]">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase">
                              <span className="text-gray-900 dark:text-white">{row.onHand} <span className="text-gray-400">/ {min}</span></span>
                              <span className={critical ? 'text-red-500' : 'text-amber-500'}>{progress}%</span>
                            </div>
                            <Progress
                              progress={progress}
                              color={critical ? 'red' : 'yellow'}
                              size="sm"
                              className="rounded-full"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Badge
                            color={critical ? 'failure' : 'warning'}
                            className="inline-flex rounded-lg px-2 py-1 font-black uppercase tracking-tighter text-[10px]"
                          >
                            {critical ? 'Crítico' : 'Bajo'}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Distribution Card */}
          {categoryDist.length > 0 && (
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="text-indigo-600 dark:text-indigo-400" size={20} />
                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Distribución por Categoría</h3>
              </div>
              <div className="space-y-4">
                {categoryDist.slice(0, 5).map((cat) => {
                  const maxCatVal = Math.max(1, categoryDist[0]?.totalValue ?? 1)
                  const percent = Math.round((cat.totalValue / maxCatVal) * 100)
                  return (
                    <div key={cat.categoryId} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-gray-900 dark:text-white">{cat.categoryName} ({cat.productCount} prods)</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(cat.totalValue)}</span>
                      </div>
                      <Progress progress={percent} color="indigo" size="sm" className="rounded-full" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
