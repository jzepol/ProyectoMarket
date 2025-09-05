'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  DollarSign,
  AlertTriangle,
  BarChart3,
  Calendar,
  Users,
  ArrowLeftRight,
  RefreshCw
} from 'lucide-react'
import { Pagination } from '@/components/Pagination'

interface Stats {
  totalProducts: number
  lowStockProducts: number
  totalSales: number
  totalRevenue: number
  totalCategories: number
  totalSuppliers: number
  totalMovements: number
  todayMovements: number
  recentSales: any[]
  topProducts: any[]
  movementsByType: any
  salesByDay: any[]
  // Paginación
  currentPage: number
  totalPages: number
  hasMore: boolean
}

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    lowStockProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalCategories: 0,
    totalSuppliers: 0,
    totalMovements: 0,
    todayMovements: 0,
    recentSales: [],
    topProducts: [],
    movementsByType: {},
    salesByDay: [],
    currentPage: 1,
    totalPages: 1,
    hasMore: false
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState('today')
  const [currentPage, setCurrentPage] = useState(1)
  const [salesPerPage] = useState(10)

  const fetchStats = useCallback(async (showLoading = false, page = 1) => {
    try {
      if (showLoading) {
        setRefreshing(true)
      }

      // Agregar timestamp para evitar caché
      const response = await fetch(`/api/stats?dateRange=${dateRange}&page=${page}&limit=${salesPerPage}&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      const data = await response.json()

      if (response.ok) {
        console.log('Debug - periodSales value:', data.periodSales, typeof data.periodSales)
        setStats({
          totalProducts: data.totalProducts,
          lowStockProducts: data.lowStockProducts,
          totalSales: data.periodSales, 
          totalRevenue: data.periodRevenue,
          totalCategories: data.totalCategories,
          totalSuppliers: data.totalSuppliers,
          totalMovements: data.totalMovements,
          todayMovements: data.periodMovements,
          recentSales: data.recentSales || [],
          topProducts: data.topProducts || [],
          movementsByType: data.movementsByType || {},
          salesByDay: data.salesByDay || [],
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          hasMore: data.hasMore
        })
      } else {
        console.error('Error fetching stats:', data.error)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [dateRange, salesPerPage])

  useEffect(() => {
    fetchStats(true, currentPage)
    
    // Actualizar datos cada 30 segundos
    const interval = setInterval(() => {
      fetchStats(false, currentPage)
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchStats, currentPage])

  useEffect(() => {
    // Refrescar datos cuando cambie el rango de fechas
    setCurrentPage(1)
    fetchStats(true, 1)
  }, [dateRange, fetchStats])

  const handleRefresh = () => {
    fetchStats(true, currentPage)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    fetchStats(true, newPage)
  }

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'today': return 'Hoy'
      case 'week': return 'Esta Semana'
      case 'month': return 'Este Mes'
      case 'year': return 'Este Año'
      default: return 'Hoy'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600">Estadísticas y análisis del negocio</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field w-auto"
          >
            <option value="today">Hoy</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
            <option value="year">Este Año</option>
          </select>
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            disabled={loading || refreshing}
          >
            {refreshing ? (
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-5 h-5 mr-2" />
            )}
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Productos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.lowStockProducts}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ventas {getDateRangeLabel()}</p>
                  <p className="text-2xl font-bold text-gray-900">{Number(stats.totalSales) || 0}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ingresos {getDateRangeLabel()}</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Categorías</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Proveedores</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSuppliers}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ArrowLeftRight className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Movimientos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMovements}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-teal-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Movimientos {getDateRangeLabel()}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayMovements}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Movements by Type */}
          {Object.keys(stats.movementsByType).length > 0 && (
            <div className="card mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Movimientos por Tipo ({getDateRangeLabel()})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(stats.movementsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        type === 'IN' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium text-gray-900">
                        {type === 'IN' ? 'Entradas' : 'Salidas'}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Sales and Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Sales with Pagination */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ventas {getDateRangeLabel()} 
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (Página {stats.currentPage} de {stats.totalPages})
                </span>
              </h3>
              <div className="space-y-3">
                {stats.recentSales.length > 0 ? (
                  <>
                    {stats.recentSales.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Venta #{sale.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(sale.createdAt).toLocaleDateString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} • {sale.items?.length || 0} items
                          </p>
                          <p className="text-xs text-gray-500">{sale.products}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{formatCurrency(sale.total)}</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Pagination Controls */}
                    <Pagination
                      currentPage={stats.currentPage}
                      totalPages={stats.totalPages}
                      onPageChange={handlePageChange}
                      className="pt-4 border-t"
                    />
                  </>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No hay ventas en este período</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Products - REAL DATA */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Vendidos ({getDateRangeLabel()})</h3>
              <div className="space-y-3">
                {stats.topProducts.length > 0 ? (
                  stats.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            {product.sales} ventas • {product.qty} unidades
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-600">{formatCurrency(product.revenue)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No hay datos de productos vendidos en este período</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sales by Day Chart */}
          {stats.salesByDay.length > 0 && (
            <div className="card mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Día ({getDateRangeLabel()})</h3>
              <div className="space-y-3">
                {stats.salesByDay.map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">
                        {new Date(day.date).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        {day.sales} ventas
                      </span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(day.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts Placeholder */}
          <div className="mt-8">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gráficos de Rendimiento</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Gráficos de ventas y tendencias</p>
                  <p className="text-sm text-gray-400">(Implementar con Chart.js o similar)</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
