'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X } from 'lucide-react'

interface Product {
  id: number
  sku: string
  barcode: string | null
  name: string
  description: string | null
  categoryId: number | null
  purchasePrice: number
  marginPct: number
  salePrice: number
  stockQty: number
  stockMin: number
  supplierId: number | null
  category?: {
    id: number
    name: string
  }
  supplier?: {
    id: number
    name: string
  }
}

interface Category {
  id: number
  name: string
}

interface Supplier {
  id: number
  name: string
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    description: '',
    categoryId: '',
    purchasePrice: '',
    marginPct: '',
    salePrice: '',
    stockQty: '',
    stockMin: '',
    supplierId: '',
    pricingMode: 'UNIT',
    packageWeightKg: '1'
  })

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [productResponse, categoriesResponse, suppliersResponse] = await Promise.all([
        fetch(`/api/products/${params.id}`),
        fetch('/api/categories'),
        fetch('/api/suppliers')
      ])

      if (!productResponse.ok) {
        throw new Error('Producto no encontrado')
      }

      const productData = await productResponse.json()
      const categoriesData = await categoriesResponse.json()
      const suppliersData = await suppliersResponse.json()

      setProduct(productData)
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : [])

      // Llenar el formulario con los datos del producto
      setFormData({
        sku: productData.sku,
        barcode: productData.barcode || '',
        name: productData.name,
        description: productData.description || '',
        categoryId: productData.categoryId?.toString() || '',
        purchasePrice: productData.purchasePrice.toString(),
        marginPct: productData.marginPct.toString(),
        salePrice: productData.salePrice.toString(),
        stockQty: productData.stockQty.toString(),
        stockMin: productData.stockMin.toString(),
        supplierId: productData.supplierId?.toString() || '',
        pricingMode: productData.pricingMode || 'UNIT',
        packageWeightKg: (productData.packageWeightKg || 1).toString()
      })
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Error al cargar el producto')
      router.push('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sku: formData.sku,
          barcode: formData.barcode || null,
          name: formData.name,
          description: formData.description || null,
          categoryId: formData.categoryId || null,
          purchasePrice: parseFloat(formData.purchasePrice),
          marginPct: parseFloat(formData.marginPct),
          salePrice: parseFloat(formData.salePrice),
          stockQty: parseFloat(formData.stockQty),
          stockMin: parseFloat(formData.stockMin),
          pricingMode: formData.pricingMode,
          packageWeightKg: parseFloat(formData.packageWeightKg || '1'),
          supplierId: formData.supplierId || null
        })
      })

      if (response.ok) {
        alert('Producto actualizado correctamente')
        router.push('/products')
      } else {
        const error = await response.json()
        alert(error.error || 'Error al actualizar producto')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Error al actualizar producto')
    } finally {
      setSaving(false)
    }
  }

  const calculateSalePrice = () => {
    const purchasePrice = parseFloat(formData.purchasePrice) || 0
    const marginPct = parseFloat(formData.marginPct) || 0
    // Usar markup (ganancia sobre precio de compra) y redondear a entero
    const salePrice = Math.round(purchasePrice * (1 + marginPct / 100))
    setFormData(prev => ({ ...prev, salePrice: salePrice.toString() }))
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Producto no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/products')}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
            <p className="text-gray-600">Modifica la información del producto</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU (Identificación Interna) *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="input-field"
                required
                placeholder="Ej: PROD-001, MANZANA-ROJA"
              />
              <p className="text-xs text-gray-500 mt-1">
                Identificador único interno del producto
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de Barras (Opcional)
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="input-field"
                placeholder="Ej: 1234567890123 (13 dígitos)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Código para escaneo en punto de venta (puede ser diferente al SKU)
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="input-field"
              >
                <option value="">Sin categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor
              </label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="input-field"
              >
                <option value="">Sin proveedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio de Compra *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                onBlur={calculateSalePrice}
                className="input-field"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Markup (%) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.marginPct}
                onChange={(e) => setFormData({ ...formData, marginPct: e.target.value })}
                onBlur={calculateSalePrice}
                className="input-field"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio de Venta *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                className="input-field"
                required
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.pricingMode === 'WEIGHT' ? '$/kg' : '$/u'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Precio
              </label>
              <select
                value={formData.pricingMode}
                onChange={(e) => setFormData({ ...formData, pricingMode: e.target.value })}
                className="input-field"
              >
                <option value="UNIT">Por unidad</option>
                <option value="WEIGHT">Por kilo</option>
              </select>
            </div>

            {formData.pricingMode === 'WEIGHT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso por paquete (kg)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={formData.packageWeightKg}
                  onChange={(e) => setFormData({ ...formData, packageWeightKg: e.target.value })}
                  className="input-field"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Actual *
              </label>
              <input
                type="number"
                value={formData.stockQty}
                onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                className="input-field"
                required
                min="0"
                step="0.001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Mínimo *
              </label>
              <input
                type="number"
                value={formData.stockMin}
                onChange={(e) => setFormData({ ...formData, stockMin: e.target.value })}
                className="input-field"
                required
                min="0"
                step="0.001"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/products')}
              className="btn-secondary flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
