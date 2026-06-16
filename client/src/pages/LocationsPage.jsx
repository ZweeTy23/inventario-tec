import { useState, useEffect } from 'react'
import { Plus, MapPin, ChevronRight } from 'lucide-react'
import { Label, TextInput, Select } from 'flowbite-react'
import { api } from '../lib/api'
import { PERMISSIONS, LOCATION_TYPES } from '../lib/constants'
import { usePermissions } from '../hooks/usePermissions'
import SearchBar from '../components/ui/SearchBar'
import FormModal from '../components/ui/FormModal'
import StatusBadge from '../components/ui/StatusBadge'
import PageError from '../components/ui/PageError'

const emptyForm = { name: '', locationType: 'ZONE', parentId: '', maxCapacity: '0' }

function LocationTreeNode({ node, depth = 0, onSelect, selectedId }) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = node.children?.length > 0
  const isSelected = selectedId === node.id

  return (
    <div>
      <button
        type="button"
        onClick={() => { onSelect(node); if (hasChildren) setExpanded(!expanded) }}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
          isSelected ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30 text-gray-700 dark:text-gray-300'
        }`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        {hasChildren && <ChevronRight size={14} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />}
        <MapPin size={14} className="text-indigo-500 shrink-0" />
        <span className="truncate font-medium">{node.name}</span>
        <StatusBadge label={LOCATION_TYPES[node.locationType] ?? node.locationType} color="indigo" />
      </button>
      {expanded && hasChildren && node.children.map((child) => (
        <LocationTreeNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} selectedId={selectedId} />
      ))}
    </div>
  )
}

export default function LocationsPage() {
  const { hasPermission } = usePermissions()
  const [tree, setTree] = useState([])
  const [flatLocations, setFlatLocations] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const canCreate = hasPermission(PERMISSIONS.INVENTORY_CREATE)
  const canUpdate = hasPermission(PERMISSIONS.INVENTORY_UPDATE)

  async function fetchLocations() {
    try {
      setLoading(true)
      const [treeRes, listRes] = await Promise.all([
        api.get('/locations/tree'),
        api.get('/locations?perPage=100'),
      ])
      setTree(treeRes.data ?? [])
      setFlatLocations(listRes.data ?? [])
    } catch (err) {
      setError(err.message || 'Error al cargar ubicaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLocations() }, [])

  function openCreate() {
    setForm({
      ...emptyForm,
      parentId: selected?.id ?? '',
      locationType: selected ? getChildType(selected.locationType) : 'WAREHOUSE',
    })
    setShowModal(true)
  }

  function getChildType(parentType) {
    const hierarchy = ['WAREHOUSE', 'ZONE', 'AISLE', 'SHELF', 'LEVEL']
    const idx = hierarchy.indexOf(parentType)
    return hierarchy[idx + 1] ?? 'LEVEL'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/locations', {
        name: form.name,
        locationType: form.locationType,
        parentId: form.parentId || null,
        maxCapacity: Number(form.maxCapacity),
      })
      setShowModal(false)
      fetchLocations()
    } catch (err) {
      alert(err.message || 'Error al crear ubicación')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredTree = searchTerm
    ? flatLocations.filter((l) => l.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : null

  if (error) return <PageError message={error} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar ubicaciones..." />
        {canCreate && (
          <button onClick={openCreate} className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Nueva Ubicación
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 max-h-[600px] overflow-y-auto">
          <h3 className="text-xs font-bold uppercase text-gray-500 mb-3">Jerarquía de Almacén</h3>
          {loading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : searchTerm && filteredTree ? (
            filteredTree.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setSelected(loc)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <MapPin size={14} className="text-indigo-500" />
                {loc.name}
              </button>
            ))
          ) : (
            tree.map((node) => (
              <LocationTreeNode key={node.id} node={node} onSelect={setSelected} selectedId={selected?.id} />
            ))
          )}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          {selected ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selected.name}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Tipo</p>
                  <p className="font-medium">{LOCATION_TYPES[selected.locationType] ?? selected.locationType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Capacidad máxima</p>
                  <p className="font-medium">{selected.maxCapacity ?? 0} unidades</p>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Ocupación visual</p>
                <div className="h-4 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-400 via-amber-400 to-red-500 transition-all"
                    style={{ width: `${Math.min(100, ((selected._count?.stockLevels ?? 0) / Math.max(selected.maxCapacity, 1)) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {selected._count?.stockLevels ?? 0} lotes registrados
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <MapPin size={48} className="mb-4 opacity-30" />
              <p>Selecciona una ubicación del árbol para ver detalles</p>
            </div>
          )}
        </div>
      </div>

      <FormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Nueva Ubicación"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div><Label>Nombre</Label><TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div>
            <Label>Tipo</Label>
            <Select value={form.locationType} onChange={(e) => setForm({ ...form, locationType: e.target.value })}>
              {Object.entries(LOCATION_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Ubicación padre (opcional)</Label>
            <Select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
              <option value="">Ninguna (raíz)</option>
              {flatLocations.map((l) => (
                <option key={l.id} value={l.id}>{l.name} ({LOCATION_TYPES[l.locationType]})</option>
              ))}
            </Select>
          </div>
          <div><Label>Capacidad máxima</Label><TextInput type="number" min="0" value={form.maxCapacity} onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })} /></div>
        </div>
      </FormModal>
    </div>
  )
}
