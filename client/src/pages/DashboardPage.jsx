import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  AlertCircle,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  Plus,
  Clock,
  ArrowRight,
  ArrowDownLeft,
  ArrowLeftRight,
} from 'lucide-react'
import { Badge, Progress } from 'flowbite-react'
import { api } from '../lib/api'
import { formatCurrency, formatDateTime } from '../lib/format'
import { MOVEMENT_TYPES } from '../lib/constants'

const directionStyle = {
  in: { dot: 'bg-green-500', icon: ArrowDownLeft, color: 'text-green-500' },
  out: { dot: 'bg-red-500', icon: ArrowUpRight, color: 'text-red-500' },
  transfer: { dot: 'bg-amber-500', icon: ArrowLeftRight, color: 'text-amber-500' },
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [valuation, setValuation] = useState(null)
  const [movements, setMovements] = useState([])
  const [movementsTotal, setMovementsTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [valRes, movRes] = await Promise.all([
        api.get('/stock-levels/valuation'),
        api.get('/movements?perPage=6'),
      ])
      setValuation(valRes.data)
      setMovements(movRes.data ?? [])
      setMovementsTotal(movRes.meta?.total ?? (movRes.data?.length ?? 0))
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los datos del panel')
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
      value: valuation ? formatCurrency(valuation.totalValue) : '—',
      icon: BarChart3,
      color: 'indigo',
    },
    {
      label: 'Productos activos',
      value: valuation ? valuation.totalProducts.toLocaleString() : '—',
      icon: Package,
      color: 'green',
    },
    {
      label: 'Stock bajo / Crítico',
      value: valuation ? String(valuation.lowStockCount) : '—',
      icon: AlertCircle,
      color: 'amber',
    },
    {
      label: 'Movimientos (total)',
      value: movementsTotal ? movementsTotal.toLocaleString() : '0',
      icon: RefreshCcw,
      color: 'blue',
    },
  ]

  const lowStockRows = valuation?.lowStockProducts ?? []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Panel Operativo <span className="text-indigo-600">En Vivo</span>
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-xl text-lg font-medium">
            {valuation
              ? <>Inventario valorado en <span className="text-gray-900 dark:text-white font-bold">{formatCurrency(valuation.totalValue)}</span> con <span className="text-gray-900 dark:text-white font-bold">{valuation.totalUnits.toLocaleString()} unidades</span> en existencia.</>
              : 'Cargando indicadores del almacén...'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Badge color="indigo" size="sm" className="px-3 py-1 rounded-full uppercase font-black tracking-widest">Sistema Sincronizado</Badge>
            {valuation && valuation.lowStockCount > 0 && (
              <Badge color="warning" size="sm" className="px-3 py-1 rounded-full uppercase font-black tracking-widest">
                {valuation.lowStockCount} Alertas de Stock
              </Badge>
            )}
          </div>
        </div>

        <div className="flex shrink-0 gap-3 relative z-10">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center rounded-2xl border-2 border-gray-200 dark:border-gray-700 font-bold px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refrescar
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/movimientos')}
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none font-bold px-5 py-2 transition-colors"
          >
            <Plus className="mr-2 h-5 w-5" /> Nueva Operación
          </button>
        </div>

        {/* Decor */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900 px-6 py-4 text-sm font-semibold text-red-600 dark:text-red-300">
          {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl bg-${kpi.color}-50 dark:bg-${kpi.color}-900/20 text-${kpi.color}-600 dark:text-${kpi.color}-400 group-hover:scale-110 transition-transform`}>
                <kpi.icon size={24} />
              </div>
            </div>
            <div className="mt-6">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{kpi.label}</p>
              <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-1 tracking-tight">{kpi.value}</h4>
            </div>
          </div>
        ))}
      </div>

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
          <div className="p-6 flex-1 space-y-8">
            {loading && movements.length === 0 && (
              <p className="text-sm text-gray-400 font-medium">Cargando movimientos...</p>
            )}
            {!loading && movements.length === 0 && (
              <p className="text-sm text-gray-400 font-medium">Aún no hay movimientos registrados.</p>
            )}
            {movements.map((m) => {
              const meta = MOVEMENT_TYPES[m.movementType]
              const style = directionStyle[meta?.direction] ?? directionStyle.transfer
              return (
                <div key={m.id} className="flex items-start group">
                  <div className={`mt-1 w-1.5 h-8 rounded-full shrink-0 ${style.dot} group-hover:h-10 transition-all duration-300`}></div>
                  <div className="ml-5 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight leading-none">{meta?.label ?? m.movementType}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center">
                        <Clock size={10} className="mr-1" /> {formatDateTime(m.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                      {m.quantity} unidades de {m.product?.name ?? 'producto'}
                    </p>
                    <p className="text-[10px] font-black text-indigo-500 uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Operado por: {m.user?.name ?? '—'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Critical Products */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
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
                      <td className="px-6 py-5">
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
                      <td className="px-6 py-5 min-w-[200px]">
                        <div className="flex flex-col gap-2">
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
                      <td className="px-6 py-5 text-right">
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
          <div className="p-6 bg-gray-50/30 dark:bg-gray-800/30 border-t border-gray-50 dark:border-gray-800">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
              Valuación calculada con costo promedio ponderado en tiempo real
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
