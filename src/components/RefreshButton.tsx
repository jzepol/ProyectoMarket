import { RefreshCw } from 'lucide-react'

interface RefreshButtonProps {
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export function RefreshButton({
  onClick,
  loading = false,
  disabled = false,
  className = '',
  children
}: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn-secondary flex items-center ${className}`}
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
      {children || (loading ? 'Actualizando...' : 'Actualizar')}
    </button>
  )
}
