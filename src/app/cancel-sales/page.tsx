'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, RefreshCw, Trash2, AlertTriangle } from 'lucide-react'

interface SaleItem {
  id: number
  product: {
    id: number
    name: string
    sku: string
  }
  qty: number
  price: number
}

interface Sale {
  id: number
  total: number
  createdAt: string
  items: SaleItem[]
}

export default function CancelSalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [cancelingId, setCancelingId] = useState<number | null>(null)

  const fetchSales = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setRefreshing(true)
      }

      const response = await fetch(`/api/sales?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      const data = await response.json()
      const salesData = data.sales || data
      setSales(Array.isArray(salesData) ? salesData : [])
    } catch (error) {
      console.error('Error fetching sales:', error)
      setSales([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchSales(true)

    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      fetchSales()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchSales])

  const handleCancelSale = async (saleId: number) => {
    if (!confirm(`¿Estás seguro de que deseas cancelar la venta #${saleId}? Esta acción devolverá los productos al stock y no se puede deshacer.`)) {
      return
    }

    setCancelingId(saleId)

    try {
      const response = await fetch(`/api/sales?id=${saleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('Venta cancelada exitosamente. Los productos han sido devueltos al stock.')
        fetchSales()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al cancelar la venta')
      }
    } catch (error) {
      console.error('Error canceling sale:', error)
      alert('Error al cancelar la venta')
    } finally {
      setCancelingId(null)
    }
  }

  const handleRefresh = () => {
    fetchSales(true)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cancelar Ventas</h1>
          <p className="text-gray-600">Cancela ventas y devuelve productos al stock</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Warning */}
      <div className="card mb-6 bg-yellow-50 border-yellow-200">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-900 mb-1">
              Advertencia
            </h3>
            <p className="text-sm text-yellow-700">
              Al cancelar una venta, los productos serán devueltos al stock y se creará un movimiento de entrada. 
              Esta acción no se puede deshacer. Asegúrate de tener la autorización necesaria antes de proceder.
            </p>
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ventas Recientes</h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando ventas...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Productos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.length > 0 ? (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{sale.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(sale.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          {sale.items?.map((item) => (
                            <div key={item.id} className="text-xs">
                              <span className="font-medium">{item.product.name}</span>
                              <span className="text-gray-500"> - {item.qty} x ${item.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ${sale.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleCancelSale(sale.id)}
                          disabled={cancelingId === sale.id}
                          className="btn-danger flex items-center"
                        >
                          {cancelingId === sale.id ? (
                            <>
                              <div className="rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Cancelando...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Cancelar
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No hay ventas registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

