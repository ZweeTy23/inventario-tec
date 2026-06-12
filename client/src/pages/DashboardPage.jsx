import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCcw,
  Plus,
  Clock,
  ArrowRight,
  TrendingDown
} from 'lucide-react'
import { Card, Button, Badge, Progress } from 'flowbite-react'

const kpis = [
  {
    label: 'Valor total inventario',
    value: '$1,284,500',
    trend: '+4.2%',
    trendUp: true,
    icon: BarChart3,
    color: 'indigo'
  },
  {
    label: 'Productos activos',
    value: '1,246',
    trend: '+12 hoy',
    trendUp: true,
    icon: Package,
    color: 'green'
  },
  {
    label: 'Stock bajo / Crítico',
    value: '34 / 7',
    trend: '-8 esta semana',
    trendUp: false,
    icon: AlertCircle,
    color: 'amber'
  },
  {
    label: 'Movimientos (24h)',
    value: '128',
    trend: '+15% vs ayer',
    trendUp: true,
    icon: RefreshCcw,
    color: 'blue'
  },
]

const movementFeed = [
  {
    type: 'Entrada de Mercancía',
    detail: '25 unidades de Cable HDMI 2.1',
    time: 'Hace 8 min',
    status: 'success',
    user: 'Luis Torres'
  },
  {
    type: 'Salida por Venta',
    detail: '8 unidades de Teclado Mecánico RGB',
    time: 'Hace 22 min',
    status: 'danger',
    user: 'Andrea Ruiz'
  },
  {
    type: 'Ajuste de Inventario',
    detail: 'Corrección de +3 en Monitor Dell 27"',
    time: 'Hace 41 min',
    status: 'info',
    user: 'Mariela Soto'
  },
  {
    type: 'Transferencia Interna',
    detail: '15 unidades de Laptop Dell XPS (Matriz -> Norte)',
    time: 'Hace 1 hora',
    status: 'warning',
    user: 'Carlos Perez'
  },
]

const lowStockRows = [
  {
    sku: 'SKU-2019',
    product: 'Batería UPS 12V 7Ah',
    stock: 4,
    min: 10,
    progress: 40,
    status: 'Bajo',
  },
  {
    sku: 'SKU-4481',
    product: 'Mouse Inalámbrico Pro',
    stock: 2,
    min: 8,
    progress: 25,
    status: 'Crítico',
  },
  {
    sku: 'SKU-9092',
    product: 'SSD 1TB NVMe Gen4',
    stock: 6,
    min: 12,
    progress: 50,
    status: 'Bajo',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Panel Operativo <span className="text-indigo-600">En Vivo</span>
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-xl text-lg font-medium">
            Gestionando <span className="text-gray-900 dark:text-white font-bold">128 movimientos</span> hoy. El almacén central reporta operatividad total.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
             <Badge color="indigo" size="sm" className="px-3 py-1 rounded-full uppercase font-black tracking-widest">Sistema Sincronizado</Badge>
             <Badge color="warning" size="sm" className="px-3 py-1 rounded-full uppercase font-black tracking-widest">34 Alertas de Stock</Badge>
          </div>
        </div>
        
        <div className="flex shrink-0 gap-3 relative z-10">
           <Button color="gray" className="rounded-2xl border-2 font-bold px-2 hover:bg-gray-50">
              <RefreshCcw className="mr-2 h-4 w-4" /> Refrescar
           </Button>
           <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none font-bold px-4 py-1">
              <Plus className="mr-2 h-5 w-5" /> Nueva Operación
           </Button>
        </div>

        {/* Decor */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl bg-${kpi.color}-50 dark:bg-${kpi.color}-900/20 text-${kpi.color}-600 dark:text-${kpi.color}-400 group-hover:scale-110 transition-transform`}>
                <kpi.icon size={24} />
              </div>
              <div className={`flex items-center px-2 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${kpi.trendUp ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                {kpi.trendUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                {kpi.trend}
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
              <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Historial en tiempo real</p>
            </div>
            <Button color="light" size="xs" className="rounded-xl font-bold">Ver Todo</Button>
          </div>
          <div className="p-6 flex-1 space-y-8">
            {movementFeed.map((movement, idx) => (
              <div key={idx} className="flex items-start group">
                <div className={`mt-1 w-1.5 h-8 rounded-full shrink-0 ${
                  movement.status === 'success' ? 'bg-green-500' : 
                  movement.status === 'danger' ? 'bg-red-500' : 
                  movement.status === 'info' ? 'bg-indigo-500' : 'bg-amber-500'
                } group-hover:h-10 transition-all duration-300`}></div>
                <div className="ml-5 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight leading-none">{movement.type}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center">
                       <Clock size={10} className="mr-1" /> {movement.time}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{movement.detail}</p>
                  <p className="text-[10px] font-black text-indigo-500 uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Operado por: {movement.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Products */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Productos Críticos</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Prioridad de reabastecimiento</p>
            </div>
            <button className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 uppercase tracking-widest flex items-center">
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
                {lowStockRows.map((row) => (
                  <tr key={row.sku} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                          <Package size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-black text-gray-900 dark:text-white tracking-tight leading-none">{row.product}</div>
                          <div className="text-[10px] font-bold text-gray-400 font-mono uppercase mt-1.5">{row.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 min-w-[200px]">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="text-gray-900 dark:text-white">{row.stock} <span className="text-gray-400">/ {row.min}</span></span>
                          <span className={row.status === 'Crítico' ? 'text-red-500' : 'text-amber-500'}>{row.progress}%</span>
                        </div>
                        <Progress 
                          progress={row.progress} 
                          color={row.status === 'Crítico' ? 'red' : 'yellow'} 
                          size="sm" 
                          className="rounded-full"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Badge 
                        color={row.status === 'Crítico' ? 'failure' : 'warning'} 
                        className="inline-flex rounded-lg px-2 py-1 font-black uppercase tracking-tighter text-[10px]"
                      >
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-gray-50/30 dark:bg-gray-800/30 border-t border-gray-50 dark:border-gray-800">
             <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Análisis basado en rotación histórica de los últimos 30 días</p>
                <div className="flex items-center text-green-500 font-black text-xs uppercase tracking-tighter">
                   <TrendingDown size={14} className="mr-1" /> -12% vs semana pasada
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
