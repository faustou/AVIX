import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'

interface AdminGuardProps {
  children: ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading, isAdmin } = useAdminAuth()

  if (loading) return null
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
