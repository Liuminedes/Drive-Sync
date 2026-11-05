import { getSession } from '@/actions/auth'

export interface TenantContext {
  tenantId: string
  userId: string
  role: string
  name: string
  email: string
}

/**
 * Obtiene el contexto de inquilino autenticado y verificado.
 * Lanza un error si no hay sesión activa, previniendo operaciones inseguras.
 */
export async function requireTenantSession(): Promise<TenantContext> {
  const session = await getSession()
  
  if (!session || !session.tenantId) {
    throw new Error('No autorizado: Sesión inválida o expirada')
  }

  return {
    tenantId: session.tenantId,
    userId: session.userId,
    role: session.role,
    name: session.name,
    email: session.email,
  }
}

/**
 * Versión no estricta para endpoints que admiten modo anónimo o público.
 */
export async function getTenantSession(): Promise<TenantContext | null> {
  try {
    return await requireTenantSession()
  } catch {
    return null
  }
}

/** Exige sesión y que el rol esté entre los permitidos (SUPERADMIN siempre pasa). */
export async function requireRole(...roles: string[]): Promise<TenantContext> {
  const s = await requireTenantSession()
  if (s.role !== 'SUPERADMIN' && !roles.includes(s.role)) {
    throw new Error('No tienes permisos para esta acción')
  }
  return s
}
