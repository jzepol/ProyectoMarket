'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface Product {
  id: number
  name: string
  sku: string
  stockQty: number
}

interface ProductSearchProps {
  products: Product[]
  value: string
  onChange: (productId: string) => void
  placeholder?: string
  required?: boolean
  className?: string
}

export function ProductSearch({
  products,
  value,
  onChange,
  placeholder = "Buscar producto por nombre o código...",
  required = false,
  className = ""
}: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filtrar productos basado en el término de búsqueda
  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase()
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower)
    )
  }).slice(0, 10) // Limitar a 10 resultados para mejor rendimiento

  // Manejar selección de producto
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setSearchTerm(`${product.name} (${product.sku})`)
    onChange(product.id.toString())
    setIsOpen(false)
  }

  // Limpiar selección
  const handleClear = () => {
    setSelectedProduct(null)
    setSearchTerm('')
    onChange('')
    inputRef.current?.focus()
  }

  // Manejar cambio en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    setIsOpen(term.length > 0)
    
    // Si el término cambia y no coincide con el producto seleccionado, limpiar selección
    if (selectedProduct && !term.includes(selectedProduct.name)) {
      setSelectedProduct(null)
      onChange('')
    }
  }

  // Manejar teclas especiales
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(searchTerm.length > 0)}
          className="input-field pl-10 pr-10"
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />
        {selectedProduct && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && filteredProducts.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleProductSelect(product)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    SKU: {product.sku}
                  </div>
                </div>
                <div className="text-sm text-gray-500 ml-2">
                  Stock: {Number(product.stockQty).toFixed(3)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {isOpen && searchTerm.length > 0 && filteredProducts.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg p-4">
          <div className="text-sm text-gray-500 text-center">
            No se encontraron productos con &quot;{searchTerm}&quot;
          </div>
        </div>
      )}
    </div>
  )
}
