import { useState, useEffect } from 'react'
import { FileText, Download, FileSpreadsheet, TrendingUp, AlertTriangle, Boxes, Truck, RefreshCw } from 'lucide-react'
import { api } from '../lib/api'
import { formatCurrency } from '../lib/format'
import { exportToPDF, exportToExcel } from '../lib/exportUtils'
import DataTable from '../components/ui/DataTable'
import PageError from '../components/ui/PageError'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('valuation')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Report data states
  const [valuationData, setValuationData] = useState(null)
  const [movementsData, setMovementsData] = useState(null)
  const [lowStockData, setLowStockData] = useState(null)
  const [suppliersData, setSuppliersData] = useState(null)

  // Filters for movements report
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [movementType, setMovementType] = useState('ALL')

  useEffect(() => {
    loadReportData()
  }, [activeTab])

  async function loadReportData() {
    setLoading(true)
    setError(null)
    try {
      if (activeTab === 'valuation') {
        const res = await api.get('/reports/valuation')
        setValuationData(res?.data ?? res)
      } else if (activeTab === 'movements') {
        let queryParams = []
        if (startDate) queryParams.push(`startDate=${startDate}`)
        if (endDate) queryParams.push(`endDate=${endDate}`)
        if (movementType !== 'ALL') queryParams.push(`movementType=${movementType}`)
        const queryString = queryParams.length ? `?${queryParams.join('&')}` : ''

        const res = await api.get(`/reports/movements-summary${queryString}`)
        setMovementsData(res?.data ?? res)
      } else if (activeTab === 'low-stock') {
        const res = await api.get('/reports/low-stock')
        setLowStockData(res?.data ?? res)
      } else if (activeTab === 'suppliers') {
        const res = await api.get('/reports/suppliers')
        setSuppliersData(res?.data ?? res)
      }
    } catch (err) {
      setError(err.message || 'Error al cargar reporte')
    } finally {
      setLoading(false)
    }
  }

  function handleFilterMovements(e) {
    e.preventDefault()
    if (activeTab === 'movements') {
      loadReportData()
    }
  }

  // Handle PDF export
  function handleExportPDF() {
    if (activeTab === 'valuation' && valuationData) {
      exportToPDF({
        title: 'Reporte de Valoración de Inventario',
        columns: [
          { header: 'Producto', key: 'name' },
          { header: 'SKU', key: 'sku' },
          { header: 'Categoría', key: 'category' },
          { header: 'Stock', key: 'totalQuantity' },
          { header: 'Precio Base', key: 'basePrice' },
          { header: 'Valor Base Total', key: 'totalBaseValue' },
          { header: 'Costo Promedio', key: 'avgCost' },
          { header: 'Valor Costo Total', key: 'totalCostValue' },
        ],
        data: valuationData.products,
        filename: 'reporte_valoracion_inventario',
      })
    } else if (activeTab === 'movements' && movementsData) {
      exportToPDF({
        title: 'Reporte de Movimientos de Almacén',
        columns: [
          { header: 'Fecha', key: 'createdAt' },
          { header: 'Tipo', key: 'type' },
          { header: 'Producto', key: 'productName' },
          { header: 'SKU', key: 'sku' },
          { header: 'Cantidad', key: 'quantity' },
          { header: 'Costo Unit.', key: 'unitCost' },
          { header: 'Costo Total', key: 'totalCost' },
          { header: 'Usuario', key: 'userName' },
        ],
        data: movementsData.movements,
        filename: 'reporte_movimientos',
      })
    } else if (activeTab === 'low-stock' && lowStockData) {
      exportToPDF({
        title: 'Reporte de Productos con Alerta de Stock',
        columns: [
          { header: 'Producto', key: 'name' },
          { header: 'SKU', key: 'sku' },
          { header: 'Categoría', key: 'category' },
          { header: 'Proveedor', key: 'supplier' },
          { header: 'Stock Mínimo', key: 'minStockAlert' },
          { header: 'Stock Actual', key: 'currentStock' },
          { header: 'Déficit', key: 'deficit' },
        ],
        data: lowStockData.items,
        filename: 'reporte_alertas_stock',
      })
    } else if (activeTab === 'suppliers' && suppliersData) {
      exportToPDF({
        title: 'Reporte de Desempeño e Inventario por Proveedor',
        columns: [
          { header: 'Proveedor', key: 'name' },
          { header: 'Confiabilidad (%)', key: 'reliabilityScore' },
          { header: 'Total Productos', key: 'totalProducts' },
          { header: 'Unidades en Stock', key: 'totalStockUnits' },
          { header: 'Valor Inv. Total', key: 'totalInventoryValue' },
        ],
        data: suppliersData.suppliers,
        filename: 'reporte_proveedores',
      })
    }
  }

  // Handle Excel export
  function handleExportExcel() {
    if (activeTab === 'valuation' && valuationData) {
      exportToExcel({
        title: 'Valoración de Inventario',
        columns: [
          { header: 'Producto', key: 'name' },
          { header: 'SKU', key: 'sku' },
          { header: 'Categoría', key: 'category' },
          { header: 'Proveedor', key: 'supplier' },
          { header: 'Stock Total', key: 'totalQuantity' },
          { header: 'Precio Base ($)', key: 'basePrice' },
          { header: 'Valor Base Total ($)', key: 'totalBaseValue' },
          { header: 'Costo Promedio ($)', key: 'avgCost' },
          { header: 'Valor Costo Total ($)', key: 'totalCostValue' },
        ],
        data: valuationData.products,
        filename: 'reporte_valoracion_inventario',
      })
    } else if (activeTab === 'movements' && movementsData) {
      exportToExcel({
        title: 'Resumen de Movimientos',
        columns: [
          { header: 'Fecha', key: 'createdAt' },
          { header: 'Tipo', key: 'type' },
          { header: 'Estado', key: 'status' },
          { header: 'Producto', key: 'productName' },
          { header: 'SKU', key: 'sku' },
          { header: 'Cantidad', key: 'quantity' },
          { header: 'Costo Unitario ($)', key: 'unitCost' },
          { header: 'Costo Total ($)', key: 'totalCost' },
          { header: 'Usuario', key: 'userName' },
          { header: 'Origen', key: 'sourceLocation' },
          { header: 'Destino', key: 'destinationLocation' },
        ],
        data: movementsData.movements,
        filename: 'reporte_movimientos',
      })
    } else if (activeTab === 'low-stock' && lowStockData) {
      exportToExcel({
        title: 'Alertas de Stock',
        columns: [
          { header: 'Producto', key: 'name' },
          { header: 'SKU', key: 'sku' },
          { header: 'Categoría', key: 'category' },
          { header: 'Proveedor', key: 'supplier' },
          { header: 'Stock Mínimo', key: 'minStockAlert' },
          { header: 'Stock Actual', key: 'currentStock' },
          { header: 'Déficit de Unidades', key: 'deficit' },
        ],
        data: lowStockData.items,
        filename: 'reporte_alertas_stock',
      })
    } else if (activeTab === 'suppliers' && suppliersData) {
      exportToExcel({
        title: 'Reporte Proveedores',
        columns: [
          { header: 'Proveedor', key: 'name' },
          { header: 'Confiabilidad', key: 'reliabilityScore' },
          { header: 'Total Productos', key: 'totalProducts' },
          { header: 'Unidades en Stock', key: 'totalStockUnits' },
          { header: 'Valor Inventario ($)', key: 'totalInventoryValue' },
        ],
        data: suppliersData.suppliers,
        filename: 'reporte_proveedores',
      })
    }
  }

  // Column definitions for active tab data table
  const valuationColumns = [
    { key: 'name', header: 'Producto / SKU', render: (row) => (
      <div>
        <div className="text-sm font-bold text-gray-900 dark:text-white">{row.name}</div>
        <div className="text-xs text-gray-500 font-mono">{row.sku}</div>
      </div>
    )},
    { key: 'category', header: 'Categoría & Proveedor', render: (row) => (
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{row.category}</span>
        <span className="text-[10px] text-gray-400">{row.supplier}</span>
      </div>
    )},
    { key: 'totalQuantity', header: 'Stock Total', render: (row) => (
      <span className="text-sm font-bold text-gray-900 dark:text-white">{row.totalQuantity} uds</span>
    )},
    { key: 'basePrice', header: 'Precio Base', render: (row) => formatCurrency(row.basePrice) },
    { key: 'totalBaseValue', header: 'Valorización Base', render: (row) => (
      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(row.totalBaseValue)}</span>
    )},
    { key: 'totalCostValue', header: 'Valorización Costo Prom.', render: (row) => (
      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.totalCostValue)}</span>
    )},
  ]

  const movementsColumns = [
    { key: 'createdAt', header: 'Fecha / Hora', render: (row) => (
      <span className="text-xs text-gray-600 dark:text-gray-400">
        {new Date(row.createdAt).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
      </span>
    )},
    { key: 'type', header: 'Tipo Movimiento', render: (row) => (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
        {row.type}
      </span>
    )},
    { key: 'productName', header: 'Producto', render: (row) => (
      <div>
        <div className="text-xs font-bold text-gray-900 dark:text-white">{row.productName}</div>
        <div className="text-[10px] font-mono text-gray-400">{row.sku}</div>
      </div>
    )},
    { key: 'quantity', header: 'Cantidad', render: (row) => (
      <span className="text-sm font-bold text-gray-900 dark:text-white">{row.quantity}</span>
    )},
    { key: 'unitCost', header: 'Costo Unit.', render: (row) => formatCurrency(row.unitCost) },
    { key: 'totalCost', header: 'Importe Total', render: (row) => (
      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.totalCost)}</span>
    )},
    { key: 'userName', header: 'Usuario', render: (row) => (
      <span className="text-xs text-gray-600 dark:text-gray-400">{row.userName}</span>
    )},
  ]

  const lowStockColumns = [
    { key: 'name', header: 'Producto / SKU', render: (row) => (
      <div>
        <div className="text-sm font-bold text-gray-900 dark:text-white">{row.name}</div>
        <div className="text-xs font-mono text-gray-400">{row.sku}</div>
      </div>
    )},
    { key: 'category', header: 'Categoría', render: (row) => <span className="text-xs text-gray-600 dark:text-gray-300">{row.category}</span> },
    { key: 'minStockAlert', header: 'Mínimo Alerta', render: (row) => <span className="text-xs font-semibold text-gray-500">{row.minStockAlert} uds</span> },
    { key: 'currentStock', header: 'Stock Actual', render: (row) => (
      <span className={`text-sm font-extrabold ${row.isCritical ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
        {row.currentStock} uds
      </span>
    )},
    { key: 'deficit', header: 'Déficit Requerido', render: (row) => (
      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-bold text-xs rounded-md">
        +{row.deficit} uds
      </span>
    )},
  ]

  const suppliersColumns = [
    { key: 'name', header: 'Proveedor', render: (row) => (
      <span className="text-sm font-bold text-gray-900 dark:text-white">{row.name}</span>
    )},
    { key: 'reliabilityScore', header: 'Puntaje Confiabilidad', render: (row) => (
      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg">
        {row.reliabilityScore} / 100
      </span>
    )},
    { key: 'totalProducts', header: 'Productos Suministrados', render: (row) => (
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{row.totalProducts} ítems</span>
    )},
    { key: 'totalStockUnits', header: 'Unidades en Bodega', render: (row) => (
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{row.totalStockUnits} uds</span>
    )},
    { key: 'totalInventoryValue', header: 'Valorización Inventario', render: (row) => (
      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.totalInventoryValue)}</span>
    )},
  ]

  if (error) return <PageError message={error} />

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <FileText className="text-indigo-600 dark:text-indigo-400" size={28} />
            Módulo de Reportes de Inventario
          </h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
            Análisis financiero, valoración de existencias, resúmenes de movimientos y exportación ejecutiva.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-200 dark:shadow-none transition-all"
          >
            <Download size={16} /> Exportar PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 dark:shadow-none transition-all"
          >
            <FileSpreadsheet size={16} /> Exportar Excel
          </button>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab('valuation')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'valuation'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-gray-800'
          }`}
        >
          <TrendingUp size={16} /> Valoración de Inventario
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'movements'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-gray-800'
          }`}
        >
          <Boxes size={16} /> Resumen de Movimientos
        </button>
        <button
          onClick={() => setActiveTab('low-stock')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'low-stock'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-gray-800'
          }`}
        >
          <AlertTriangle size={16} /> Alertas de Stock
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'suppliers'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-gray-800'
          }`}
        >
          <Truck size={16} /> Desempeño Proveedores
        </button>
      </div>

      {/* Tab 1: Valoración Content */}
      {activeTab === 'valuation' && valuationData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
              <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Total Catálogo</span>
              <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{valuationData.summary.totalProducts} Productos</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
              <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Unidades Totales</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{valuationData.summary.totalQuantity} uds</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
              <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Valor Precio Base</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(valuationData.summary.totalBaseValue)}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
              <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Valor Costo Promedio</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(valuationData.summary.totalCostValue)}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 font-bold text-gray-900 dark:text-white text-base">
              Detalle de Valoración de Productos
            </div>
            <DataTable columns={valuationColumns} data={valuationData.products} loading={loading} />
          </div>
        </div>
      )}

      {/* Tab 2: Movimientos Content */}
      {activeTab === 'movements' && (
        <div className="space-y-6">
          <form onSubmit={handleFilterMovements} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Fecha Fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Tipo de Movimiento</label>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="ALL">Todos los tipos</option>
                <option value="PURCHASE_ENTRY">Entrada por Compra</option>
                <option value="SALE_EXIT">Salida por Venta</option>
                <option value="RETURN_ENTRY">Devolución</option>
                <option value="LOSS_EXIT">Pérdida / Merma</option>
                <option value="TRANSFER">Transferencia</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-1.5"
            >
              <RefreshCw size={14} /> Aplicar Filtros
            </button>
          </form>

          {movementsData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Operaciones</span>
                  <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{movementsData.summary.totalMovements} Movimientos</div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Unidades Movilizadas</span>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{movementsData.summary.totalQuantityMoved} uds</div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Importe Financiero Total</span>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(movementsData.summary.totalCostMoved)}</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 font-bold text-gray-900 dark:text-white text-base">
                  Listado de Movimientos
                </div>
                <DataTable columns={movementsColumns} data={movementsData.movements} loading={loading} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 3: Alertas Content */}
      {activeTab === 'low-stock' && lowStockData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
              <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Total Alertas Active</span>
              <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{lowStockData.totalAlerts} Productos</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
              <span className="text-[10px] font-extrabold uppercase text-red-500 tracking-wider">Agotado Crítico (0 Stock)</span>
              <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{lowStockData.criticalCount} ítems</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
              <span className="text-[10px] font-extrabold uppercase text-amber-500 tracking-wider">Bajo Stock Mínimo</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{lowStockData.warningCount} ítems</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 font-bold text-gray-900 dark:text-white text-base">
              Productos Requeridos para Reposición
            </div>
            <DataTable columns={lowStockColumns} data={lowStockData.items} loading={loading} />
          </div>
        </div>
      )}

      {/* Tab 4: Proveedores Content */}
      {activeTab === 'suppliers' && suppliersData && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
            <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Proveedores Registrados</span>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{suppliersData.totalSuppliers} Aliados Comerciales</div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 font-bold text-gray-900 dark:text-white text-base">
              Rendimiento e Inventario por Proveedor
            </div>
            <DataTable columns={suppliersColumns} data={suppliersData.suppliers} loading={loading} />
          </div>
        </div>
      )}
    </div>
  )
}
