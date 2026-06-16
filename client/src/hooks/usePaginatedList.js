import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'

export function usePaginatedList(endpoint, { perPage = 20, filters = {} } = {}) {
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, perPage, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const fetchList = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: String(page),
        perPage: String(perPage),
        ...(search ? { q: search } : {}),
        ...Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== undefined && v !== '' && v !== 'all')
        ),
      })
      const response = await api.get(`${endpoint}?${params}`)
      setItems(response.data ?? [])
      setMeta(response.meta ?? { page, perPage, total: 0, totalPages: 0 })
    } catch (err) {
      setError(err.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [endpoint, page, perPage, search, JSON.stringify(filters)])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  return {
    items,
    meta,
    loading,
    error,
    page,
    setPage,
    search,
    setSearch,
    refresh: fetchList,
  }
}
