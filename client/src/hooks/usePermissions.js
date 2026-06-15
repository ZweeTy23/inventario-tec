import { useAuth } from '../auth/AuthContext'

export function usePermissions() {
  const { user } = useAuth()
  const permissions = user?.permissions ?? []

  function hasPermission(...required) {
    if (!required.length) return true
    return required.every((p) => permissions.includes(p))
  }

  function hasAnyPermission(...required) {
    if (!required.length) return true
    return required.some((p) => permissions.includes(p))
  }

  return { permissions, hasPermission, hasAnyPermission }
}
