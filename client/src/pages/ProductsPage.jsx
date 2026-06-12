import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Package, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react'
import { Modal, Label, TextInput, Select, Button } from 'flowbite-react'
import { api } from '../lib/api'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Modal & Form state
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    categoryId: '',
    supplierId: '',
    basePrice: '',
    minStockAlert: '5'
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [prodRes, catRes, suppRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/suppliers')
      ])
      setProducts(prodRes.data)
      setCategories(catRes.data)
      setSuppliers(suppRes.data)
      
      if (catRes.data.length > 0 && !newProduct.categoryId) {
        setNewProduct(prev => ({ ...prev, categoryId: catRes.data[0].id }))
      }
      if (suppRes.data.length > 0 && !newProduct.supplierId) {
        setNewProduct(prev => ({ ...prev, supplierId: suppRes.data[0].id }))
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('No se pudo cargar la información del catálogo.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/products', {
        ...newProduct,
        basePrice: Number(newProduct.basePrice),
        minStockAlert: Number(newProduct.minStockAlert)
      })
      setShowModal(false)
      setNewProduct({
        name: '',
        sku: '',
        categoryId: categories[0]?.id || '',
        supplierId: suppliers[0]?.id || '',
        basePrice: '',
        minStockAlert: '5'
      })
      fetchData()
    } catch (err) {
      alert(err.message || 'Error al crear producto')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return
    try {
      await api.delete(`/products/${id}`)
      fetchData()
    } catch (err) {
      alert(err.message || 'Error al eliminar producto')
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Cargando catálogo...</p>
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Nuevo Producto
        </button>
      </div>

      {/* Creation Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Registrar Nuevo Producto</Modal.Header>
        <form onSubmit={handleCreate}>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" value="Nombre del Producto" />
                <TextInput
                  id="name"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="sku" value="SKU / Código" />
                <TextInput
                  id="sku"
                  required
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="basePrice" value="Precio Base" />
                  <TextInput
                    id="basePrice"
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.basePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, basePrice: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="minStock" value="Alerta Stock Mín." />
                  <TextInput
                    id="minStock"
                    type="number"
                    required
                    value={newProduct.minStockAlert}
                    onChange={(e) => setNewProduct({ ...newProduct, minStockAlert: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" value="Categoría" />
                  <Select
                    id="category"
                    required
                    value={newProduct.categoryId}
                    onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supplier" value="Proveedor" />
                  <Select
                    id="supplier"
                    required
                    value={newProduct.supplierId}
                    onChange={(e) => setNewProduct({ ...newProduct, supplierId: e.target.value })}
                  >
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.name}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button color="gray" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Producto / SKU
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Categoría & Proveedor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Precio Base
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Configuración
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => {
                const currentStock = product._count?.stockLevels || 0 
                const isLowStock = currentStock > 0 && currentStock <= product.minStockAlert

                return (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                          <Package size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{product.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono uppercase">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{product.category?.name}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">{product.supplier?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                      ${Number(product.basePrice).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                           <span className="text-xs text-gray-500 dark:text-gray-400">Min. Alerta: {product.minStockAlert}</span>
                           {isLowStock && <AlertTriangle size={12} className="ml-2 text-amber-500" />}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-gray-50 dark:bg-gray-700/50 rounded-md">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors bg-gray-50 dark:bg-gray-700/50 rounded-md"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Mostrando <span className="font-bold">{filteredProducts.length}</span> de <span className="font-bold">{products.length}</span> productos
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50" disabled>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  )
}
