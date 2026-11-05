'use server'

import { prisma } from '@/lib/prisma'
import { requireTenantSession } from '@/lib/tenant'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

/** Solo rol SUPERADMIN (asignar con SQL: UPDATE usuarios SET rol='SUPERADMIN' WHERE email='...'). */
async function requireSuperAdmin() {
  const session = await requireTenantSession()
  if (session.role !== 'SUPERADMIN') throw new Error('Solo el SuperAdmin puede realizar esta acción')
  return session
}

/**
 * Obtiene métricas globales de toda la plataforma
 */
export async function getSuperAdminMetrics() {
  try {
    await requireSuperAdmin()

    const [tenantsCount, usersCount, vehiclesCount, leadsCount] = await Promise.all([
      prisma.tenants.count(),
      prisma.usuarios.count(),
      prisma.productos.count(),
      prisma.leads.count()
    ])

    return {
      success: true,
      data: {
        tenantsCount,
        usersCount,
        vehiclesCount,
        leadsCount
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Lista todos los concesionarios (tenants) registrados en la plataforma
 */
export async function getTenantsList() {
  try {
    await requireSuperAdmin()

    const tenants = await prisma.tenants.findMany({
      orderBy: { created_at: 'desc' }
    })

    const [v, u, l] = await Promise.all([
      prisma.productos.groupBy({ by: ['tenant_id'], _count: { _all: true } }),
      prisma.usuarios.groupBy({ by: ['tenant_id'], _count: { _all: true } }),
      prisma.leads.groupBy({ by: ['tenant_id'], _count: { _all: true } }),
    ])
    const n = (rows: { tenant_id: string; _count: { _all: number } }[], id: string) =>
      rows.find((r) => r.tenant_id === id)?._count._all ?? 0
    const enrichedTenants = tenants.map((t) => ({
      ...t,
      vehiculos_count: n(v, t.id),
      usuarios_count: n(u, t.id),
      leads_count: n(l, t.id),
    }))

    return { success: true, data: enrichedTenants }
  } catch (error: any) {
    return { success: false, error: error.message, data: [] }
  }
}

/**
 * Crea una nueva empresa (Tenant) con su administrador inicial
 */
export async function createTenantWithAdmin(data: {
  nombre: string
  dominio_personalizado?: string
  admin_nombre: string
  admin_email: string
  admin_password: string
}) {
  try {
    await requireSuperAdmin()

    if (!data.nombre?.trim() || !data.admin_email?.trim()) return { success: false, error: 'Nombre y correo son obligatorios' }
    if (!data.admin_password || data.admin_password.length < 8) return { success: false, error: 'La contraseña debe tener al menos 8 caracteres' }

    // 1. Verificar si el email ya existe
    const existingUser = await prisma.usuarios.findUnique({
      where: { email: data.admin_email }
    })

    if (existingUser) {
      return { success: false, error: 'El correo electrónico ya está registrado para otro usuario' }
    }

    // 2. Crear el Tenant
    const newTenant = await prisma.tenants.create({
      data: {
        nombre: data.nombre,
        dominio_personalizado: data.dominio_personalizado || null,
        configuracion: {
          plan: 'PRO',
          estado: 'ACTIVO',
          limite_vehiculos: 100
        }
      }
    })

    // 3. Hashear password y crear el usuario administrador inicial
    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(data.admin_password, salt)

    const newAdmin = await prisma.usuarios.create({
      data: {
        tenant_id: newTenant.id,
        nombre_completo: data.admin_nombre,
        email: data.admin_email,
        rol: 'ADMIN',
        password_hash: password_hash
      }
    })

    // 4. Crear un perfil de asesor base para este tenant
    await prisma.perfil_asesor.create({
      data: {
        tenant_id: newTenant.id,
        nombre: data.admin_nombre,
        email: data.admin_email,
        cargo: 'Director Comercial',
        concesionario: data.nombre
      }
    })

    revalidatePath('/dashboard/superadmin')
    return { success: true, data: { tenant: newTenant, admin: newAdmin } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
