import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Truck, Globe, Mail, Phone, Loader2 } from 'lucide-react'
import { api } from '../lib/api'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function fetchSuppliers() {
      try {
        setLoading(true)
        const response = await api.get('/suppliers')
        setSuppliers(response.data)
      } catch (err) {
        console.error('Error fetching suppliers:', err)
        setError('No se pudieron cargar los proveedores.')
      } finally {
        setLoading(false)
      }
    }
    fetchSuppliers()
  }, [])

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Cargando proveedores...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
            placeholder="Buscar proveedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Nuevo Proveedor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <Truck size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{supplier.name}</h3>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Globe size={12} className="mr-1" />
                    {supplier.location}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{supplier.reliability}%</div>
                <div className="text-[10px] text-gray-400 uppercase font-semibold">Fiabilidad</div>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Mail size={16} className="mr-2 text-gray-400" />
                {supplier.contact}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Phone size={16} className="mr-2 text-gray-400" />
                {supplier.phone}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-2">
              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Edit2 size={14} className="mr-1" /> Editar
              </button>
              <button className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                <Trash2 size={14} className="mr-1" /> Eliminar
              </button>
            </div>
          </div>
        ))}
        {filteredSuppliers.length === 0 && (
          <div className="col-span-full py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400">No se encontraron proveedores.</p>
          </div>
        )}
      </div>
    </div>
  )
}
