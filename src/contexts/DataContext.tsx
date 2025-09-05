'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface DataContextType {
  refreshAll: () => void
  refreshDashboard: () => void
  refreshReports: () => void
  refreshMovements: () => void
  refreshProducts: () => void
  isRefreshing: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true)
    
    // Disparar un evento personalizado que las páginas pueden escuchar
    window.dispatchEvent(new CustomEvent('refresh-all-data'))
    
    // Simular un pequeño delay para mostrar el estado de refreshing
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }, [])

  const refreshDashboard = useCallback(() => {
    window.dispatchEvent(new CustomEvent('refresh-dashboard'))
  }, [])

  const refreshReports = useCallback(() => {
    window.dispatchEvent(new CustomEvent('refresh-reports'))
  }, [])

  const refreshMovements = useCallback(() => {
    window.dispatchEvent(new CustomEvent('refresh-movements'))
  }, [])

  const refreshProducts = useCallback(() => {
    window.dispatchEvent(new CustomEvent('refresh-products'))
  }, [])

  return (
    <DataContext.Provider value={{
      refreshAll,
      refreshDashboard,
      refreshReports,
      refreshMovements,
      refreshProducts,
      isRefreshing
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
