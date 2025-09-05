import { useState, useCallback } from 'react'

interface UseFetchOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  antiCache?: boolean
}

interface UseFetchReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (options?: Partial<UseFetchOptions>) => Promise<void>
  refresh: () => Promise<void>
}

export function useFetch<T = any>(initialOptions: UseFetchOptions): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (options: Partial<UseFetchOptions> = {}) => {
    const finalOptions = { ...initialOptions, ...options }
    
    try {
      setLoading(true)
      setError(null)

      const fetchOptions: RequestInit = {
        method: finalOptions.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...finalOptions.headers
        }
      }

      // Agregar opciones anti-caché si está habilitado
      if (finalOptions.antiCache !== false) {
        const url = new URL(finalOptions.url, window.location.origin)
        url.searchParams.set('t', Date.now().toString())
        
        fetchOptions.headers = {
          ...fetchOptions.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
        
        finalOptions.url = url.toString()
      }

      if (finalOptions.body && finalOptions.method !== 'GET') {
        fetchOptions.body = JSON.stringify(finalOptions.body)
      }

      const response = await fetch(finalOptions.url, fetchOptions)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [initialOptions])

  const refresh = useCallback(() => {
    return execute()
  }, [execute])

  return {
    data,
    loading,
    error,
    execute,
    refresh
  }
}
