import { useEffect, useRef, useCallback } from 'react'

interface UseAutoRefreshOptions {
  interval?: number // Intervalo en milisegundos
  enabled?: boolean // Si está habilitado
  onRefresh?: () => void // Función a ejecutar en cada refresh
}

export function useAutoRefresh({
  interval = 30000, // 30 segundos por defecto
  enabled = true,
  onRefresh
}: UseAutoRefreshOptions = {}) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startInterval = useCallback(() => {
    if (!enabled || !onRefresh) return

    // Limpiar intervalo existente
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Crear nuevo intervalo
    intervalRef.current = setInterval(() => {
      onRefresh()
    }, interval)
  }, [enabled, interval, onRefresh])

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      startInterval()
    } else {
      stopInterval()
    }

    // Cleanup al desmontar
    return () => {
      stopInterval()
    }
  }, [enabled, startInterval, stopInterval])

  return {
    startInterval,
    stopInterval
  }
}
