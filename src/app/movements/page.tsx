'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, ArrowUp, ArrowDown, RefreshCw, Filter, X } from 'lucide-react'
import { ProductSearch } from '@/components/ProductSearch'

interface Product {
  id: number
  name: string
  sku: string
  stockQty: number
}

interface Movement {
  id: number
  product: {
    name: string
    sku: string
  }
  type: 'IN' | 'OUT'
  qty: number
  reference: string | null
  date: string
}

export default function MovementsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    productId: '',
    type: 'IN',
    qty: '',
    reference: ''
  })
  const [filters, setFilters] = useState({
    productId: '',
    dateFrom: '',
    dateTo: ''
  })

  const fetchData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setRefreshing(true)
      }
      
      // Construir parámetros de búsqueda
      const movementParams = new URLSearchParams()
      movementParams.append('t', Date.now().toString())
      
      if (filters.productId) {
        movementParams.append('productId', filters.productId)
      }
      if (filters.dateFrom) {
        movementParams.append('dateFrom', filters.dateFrom)
      }
      if (filters.dateTo) {
        movementParams.append('dateTo', filters.dateTo)
      }
      
      const [productsResponse, movementsResponse] = await Promise.all([
        fetch(`/api/products?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }),
        fetch(`/api/movements?${movementParams.toString()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      ])
      
      const productsData = await productsResponse.json()
      const movementsResponseData = await movementsResponse.json()
      
      // Asegurar que los datos sean arrays
      setProducts(Array.isArray(productsData) ? productsData : [])
      
      // La API de movimientos devuelve un objeto con movements, total, hasMore
      const movementsData = movementsResponseData.movements || movementsResponseData
      setMovements(Array.isArray(movementsData) ? movementsData : [])
    } catch (error) {
      console.error('Error fetching data:', error)
      // En caso de error, establecer arrays vacíos
      setProducts([])
      setMovements([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filters])

  useEffect(() => {
    fetchData(true)
    
    // Actualizar datos cada 30 segundos
    const interval = setInterval(() => {
      fetchData()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchData])

  const handleRefresh = () => {
    fetchData(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: parseInt(formData.productId),
          type: formData.type,
          qty: parseFloat(formData.qty),
          reference: formData.reference || null
        })
      })

      if (response.ok) {
        setFormData({
          productId: '',
          type: 'IN',
          qty: '',
          reference: ''
        })
        setShowForm(false)
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear movimiento')
      }
    } catch (error) {
      console.error('Error creating movement:', error)
      alert('Error al crear movimiento')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      productId: '',
      type: 'IN',
      qty: '',
      reference: ''
    })
    setShowForm(false)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      productId: '',
      dateFrom: '',
      dateTo: ''
    })
  }

  const hasActiveFilters = filters.productId || filters.dateFrom || filters.dateTo

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Movimientos de Stock</h1>
          <p className="text-gray-600">Gestiona entradas y salidas de inventario</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Movimiento
          </button>
        </div>
      </div>

      {/* Add Movement Form */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nuevo Movimiento</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto
                </label>
                <ProductSearch
                  products={products}
                  value={formData.productId}
                  onChange={(productId) => setFormData({ ...formData, productId })}
                  placeholder="Buscar por nombre o código de barras..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'IN' | 'OUT' })}
                  className="input-field"
                  required
                >
                  <option value="IN">Entrada</option>
                  <option value="OUT">Salida</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={formData.qty}
                  onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                  className="input-field"
                  min="0.001"
                  step="0.001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referencia/Motivo
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Reposición, Venta, Merma"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros de Búsqueda
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Limpiar filtros
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Producto
            </label>
            <ProductSearch
              products={products}
              value={filters.productId}
              onChange={(productId) => handleFilterChange('productId', productId)}
              placeholder="Buscar por producto..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="input-field"
              min={filters.dateFrom || undefined}
            />
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de Movimientos</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando movimientos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referencia
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(movements) && movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(movement.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{movement.product.name}</div>
                        <div className="text-sm text-gray-500">SKU: {movement.product.sku}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {movement.type === 'IN' ? (
                          <ArrowUp className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-red-500 mr-2" />
                        )}
                        <span className={`text-sm font-medium ${
                          movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.type === 'IN' ? 'Entrada' : 'Salida'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {movement.qty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.reference || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (!Array.isArray(movements) || movements.length === 0) && (
          <div className="text-center py-8">
            <ArrowUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay movimientos registrados</p>
          </div>
        )}
      </div>
    </div>
  )
}

