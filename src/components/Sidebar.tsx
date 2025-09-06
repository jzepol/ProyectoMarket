'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Tag,
  Building2,
  TrendingUp,
  ArrowLeftRight
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Productos', href: '/products', icon: Package },
  { name: 'Nueva de Venta', href: '/pos', icon: ShoppingCart },
  { name: 'Movimientos', href: '/movements', icon: ArrowLeftRight },
  { name: 'Categorías', href: '/categories', icon: Tag },
  { name: 'Proveedores', href: '/suppliers', icon: Building2 },
  { name: 'Reportes', href: '/reports', icon: TrendingUp },
]

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white backdrop-blur-xl shadow-xl border-r border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 bg-gradient-to-r from-blue-600 to-purple-600">
            <h1 className="text-xl font-bold text-white">Proyecto Market</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-gray-900 hover:shadow-md'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white backdrop-blur-xl shadow-xl border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
            <h1 className="text-xl font-bold text-white">Proyecto Market</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-gray-900 hover:shadow-md'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              © 2025 Proyecto Market Jzepol
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-3 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-white bg-white backdrop-blur-sm shadow-lg border border-gray-200 transition-all duration-300"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Spacer for mobile */}
      <div className="lg:hidden h-16" />
    </>
  )
}
