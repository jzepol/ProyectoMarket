'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Minus, Trash2, ShoppingCart, DollarSign, RefreshCw } from 'lucide-react'

interface Product {
  id: number
  name: string
  sku: string
  salePrice: number
  stockQty: number
  pricingMode?: 'UNIT' | 'WEIGHT'
}

interface CartItem {
  product: Product
  quantity: number // en kg
  total: number
  unit?: 'kg' | 'g'
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchProducts = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setRefreshing(true)
      }
      
      // Agregar timestamp para evitar caché
      const response = await fetch(`/api/products?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts(true)
    
    // Actualizar productos cada 30 segundos
    const interval = setInterval(() => {
      fetchProducts()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchProducts])

  const handleRefresh = () => {
    fetchProducts(true)
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id)
      
      if (existingItem) {
        // Verificar stock disponible
        if (existingItem.quantity >= product.stockQty) {
          alert('No hay suficiente stock disponible')
          return prevCart
        }
        
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.product.salePrice }
            : item
        )
      } else {
        return [...prevCart, {
          product,
          quantity: 1,
          total: product.salePrice,
          unit: product.pricingMode === 'WEIGHT' ? 'kg' : undefined
        }]
      }
    })
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    const isWeight = product.pricingMode === 'WEIGHT'
    const minVal = isWeight ? 0.001 : 1
    const adjusted = isWeight ? Number(newQuantity.toFixed(3)) : Math.round(newQuantity)

    if (adjusted < minVal) return
    if (adjusted > product.stockQty) {
      alert('No hay suficiente stock disponible')
      return
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: adjusted, total: adjusted * item.product.salePrice }
          : item
      )
    )
  }

  const updateQuantityWithUnit = (productId: number, value: number, unit: 'kg' | 'g') => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    const qtyInKg = unit === 'g' ? value / 1000 : value
    if (qtyInKg < 0.001) return
    if (qtyInKg > product.stockQty) {
      alert('No hay suficiente stock disponible')
      return
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, unit, quantity: qtyInKg, total: qtyInKg * item.product.salePrice }
          : item
      )
    )
  }

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId))
  }

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío')
      return
    }

    setProcessing(true)

    try {
      const total = getTotal()
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          total,
          items: cart.map(item => ({
            productId: item.product.id,
            qty: item.quantity,
            price: item.product.salePrice
          }))
        })
      })

      if (response.ok) {
        alert('Venta realizada con éxito')
        setCart([])
        fetchProducts() // Actualizar stock
      } else {
        const error = await response.json()
        alert(error.error || 'Error al procesar la venta')
      }
    } catch (error) {
      console.error('Error processing sale:', error)
      alert('Error al procesar la venta')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Punto de Venta</h1>
          <p className="text-gray-600">Realiza ventas rápidas y eficientes</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary flex items-center"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Search and List */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Buscar Productos</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos Disponibles</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando productos...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                      <div className="text-sm text-gray-500">Stock: {Number(product.stockQty).toFixed(3)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        ${product.salePrice} {product.pricingMode === 'WEIGHT' ? <span className="text-xs text-gray-500">/kg</span> : <span className="text-xs text-gray-500">/u</span>}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          addToCart(product)
                        }}
                        className="mt-1 p-1 bg-primary-600 text-white rounded hover:bg-primary-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {filteredProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Shopping Cart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Carrito de Compras</h2>
            <ShoppingCart className="w-5 h-5 text-gray-400" />
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">El carrito está vacío</p>
              <p className="text-sm text-gray-400">Agrega productos para comenzar</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.product.name}</div>
                      <div className="text-sm text-gray-500">
                        ${item.product.salePrice} {item.product.pricingMode === 'WEIGHT' ? '/kg' : '/u'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-12 text-center font-medium">
                        {item.product.pricingMode === 'WEIGHT' ? item.quantity.toFixed(3) : Math.round(item.quantity)}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <div className="text-right ml-4">
                        <div className="font-semibold text-gray-900">${item.total.toFixed(2)}</div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {item.product.pricingMode === 'WEIGHT' && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <label className="text-xs text-gray-500">Cantidad:</label>
                      <input
                        type="number"
                        className="input-field w-28"
                        min={item.unit === 'g' ? 1 : 0.001}
                        step={item.unit === 'g' ? 1 : 0.001}
                        value={item.unit === 'g' ? Math.round(item.quantity * 1000) : Number(item.quantity.toFixed(3))}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value)
                          if (isNaN(val)) return
                          updateQuantityWithUnit(item.product.id, val, item.unit || 'kg')
                        }}
                      />
                      <select
                        className="input-field w-20"
                        value={item.unit || 'kg'}
                        onChange={(e) => updateQuantityWithUnit(item.product.id, item.unit === 'g' ? Math.round(item.quantity * 1000) : Number(item.quantity.toFixed(3)), e.target.value as 'kg' | 'g')}
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                      </select>
                      <span className="text-xs text-gray-500">Stock: {Number(item.product.stockQty).toFixed(3)} kg</span>
                    </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-green-600">${getTotal().toFixed(2)}</span>
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={processing}
                  className="w-full mt-4 btn-primary flex items-center justify-center"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Finalizar Venta
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

