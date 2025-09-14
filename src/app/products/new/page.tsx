'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

interface Category {
  id: number
  name: string
}

interface Supplier {
  id: number
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    description: '',
    categoryId: '',
    purchasePrice: '',
    marginPct: '',
    salePrice: '',
    stockQty: '0',
    stockMin: '0',
    supplierId: '',
    pricingMode: 'UNIT',
    packageWeightKg: '1'
  })

  useEffect(() => {
    fetchCategories()
    fetchSuppliers()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      const data = await response.json()
      setSuppliers(data)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/products')
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear el producto')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Error al crear el producto')
    } finally {
      setLoading(false)
    }
  }

  // Calcular precio de venta basado en precio de compra y markup
  const calculateSalePrice = (purchasePrice: string, markupPct: string) => {
    if (purchasePrice && markupPct) {
      const purchase = parseFloat(purchasePrice)
      const markup = parseFloat(markupPct)
      return (purchase * (1 + markup / 100)).toFixed(2)
    }
    return ''
  }

  // Calcular porcentaje de markup basado en precio de compra y venta
  const calculateMarkupPct = (purchasePrice: string, salePrice: string) => {
    if (purchasePrice && salePrice) {
      const purchase = parseFloat(purchasePrice)
      const sale = parseFloat(salePrice)
      if (purchase > 0) {
        return (((sale - purchase) / purchase) * 100).toFixed(2)
      }
    }
    return ''
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let newFormData = { ...formData, [name]: value }

    // Si cambia el precio de compra o el markup, calcular precio de venta
    if (name === 'purchasePrice' || name === 'marginPct') {
      const salePrice = calculateSalePrice(
        name === 'purchasePrice' ? value : formData.purchasePrice,
        name === 'marginPct' ? value : formData.marginPct
      )
      newFormData.salePrice = salePrice
    }

    // Si cambia el precio de venta, calcular markup
    if (name === 'salePrice') {
      const markupPct = calculateMarkupPct(formData.purchasePrice, value)
      newFormData.marginPct = markupPct
    }

    setFormData(newFormData)
  }

  // Función específica para manejar cambios en precio de venta
  const handleSalePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const purchasePrice = formData.purchasePrice
    
    if (purchasePrice && value) {
      const purchase = parseFloat(purchasePrice)
      const sale = parseFloat(value)
      
      if (purchase > 0) {
        const markupPct = (((sale - purchase) / purchase) * 100).toFixed(2)
        setFormData(prev => ({
          ...prev,
          salePrice: value,
          marginPct: markupPct
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        salePrice: value
      }))
    }
  }

  // Función específica para manejar cambios en precio de compra
  const handlePurchasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const salePrice = formData.salePrice
    
    if (value && salePrice) {
      const purchase = parseFloat(value)
      const sale = parseFloat(salePrice)
      
      if (purchase > 0) {
        const markupPct = (((sale - purchase) / purchase) * 100).toFixed(2)
        setFormData(prev => ({
          ...prev,
          purchasePrice: value,
          marginPct: markupPct
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        purchasePrice: value
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/products" className="mr-4">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Nuevo Producto</h1>
                <p className="text-gray-600">Agregar producto al inventario</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-white">Información Básica</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU (Identificación Interna) *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Ej: PROD-001, MANZANA-ROJA"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Identificador único interno del producto
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Barras (Opcional)
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ej: 1234567890123 (13 dígitos)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Código para escaneo en punto de venta (puede ser diferente al SKU)
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Nombre del producto"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="input-field"
                  placeholder="Descripción del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor
                </label>
                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Seleccionar proveedor</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-white">Precios y Stock</h2>
            </div>
            
            {/* Información sobre cálculo de precios */}
            {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Cálculo de Precios Flexible</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Método 1:</strong> Ingresa precio de compra + markup → Se calcula automáticamente el precio de venta</p>
                <p><strong>Método 2:</strong> Ingresa precio de compra + precio de venta → Se calcula automáticamente el markup</p>
              </div>
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Precio
                </label>
                <select
                  name="pricingMode"
                  value={formData.pricingMode}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="UNIT">Por unidad</option>
                  <option value="WEIGHT">Por kilo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Compra *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handlePurchasePriceChange}
                    required
                    step="0.01"
                    min="0"
                    className="input-field pl-8"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.pricingMode === 'WEIGHT' ? 'Precio por kg' : 'Precio por unidad'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Markup (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="marginPct"
                    value={formData.marginPct}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className="input-field pr-8"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Se calcula automáticamente si ingresas el precio de venta
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Venta *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleSalePriceChange}
                    required
                    step="0.01"
                    min="0"
                    className="input-field pl-8"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.pricingMode === 'WEIGHT' ? '$/kg' : '$/u'} - Se calcula automáticamente el markup
                  </p>
                </div>
              </div>

              {formData.pricingMode === 'WEIGHT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso por paquete (kg)
                  </label>
                  <input
                    type="number"
                    name="packageWeightKg"
                    value={formData.packageWeightKg}
                    onChange={handleChange}
                    min="0.001"
                    step="0.001"
                    className="input-field"
                    placeholder="Ej: 20"
                  />
                  <p className="text-xs text-gray-500 mt-1">Solo informativo para tus compras.</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Inicial
                </label>
                <input
                  type="number"
                  name="stockQty"
                  value={formData.stockQty}
                  onChange={handleChange}
                  min="0"
                  step="0.001"
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  name="stockMin"
                  value={formData.stockMin}
                  onChange={handleChange}
                  min="0"
                  step="0.001"
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link href="/products" className="btn btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <div className="rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

