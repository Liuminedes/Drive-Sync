'use server'

import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

type Row = Record<string, any>

// Columnas extra (relaciones) que vienen en el backup y no existen en la tabla.
const STRIP: Record<string, string[]> = {
  productos: ['producto_fotos', 'leads'],
  leads: ['productos', 'usuarios'],
  usuarios: ['leads'],
}
const TABLES = ['usuarios', 'sedes', 'perfil_asesor', 'productos', 'producto_fotos', 'resenas', 'entregas', 'leads']
export type BackupTable = 'usuarios' | 'sedes' | 'perfil_asesor' | 'productos' | 'producto_fotos' | 'resenas' | 'entregas' | 'leads'

/**
 * Restaura un lote de filas de una tabla en la empresa de la sesión (upsert por id: idempotente, no borra nada).
 * Fuerza tenant_id y rechaza ids que ya pertenezcan a otra empresa.
 */
export async function importBackupChunk(table: BackupTable, rows: Row[]) {
  try {
    const { tenantId, role } = await requireRole('ADMIN')
    if (!TABLES.includes(table)) return { success: false, error: 'Tabla no permitida' }
    if (!Array.isArray(rows) || rows.length > 500) return { success: false, error: 'Lote inválido' }
    const db = (prisma as any)[table]

    if (table === 'perfil_asesor') {
      for (const r of rows) {
        const { tenant_id, ...rest } = r
        await db.upsert({ where: { tenant_id: tenantId }, update: rest, create: { ...rest, tenant_id: tenantId } })
      }
      return { success: true, count: rows.length }
    }

    const ids = rows.map((r) => r.id).filter(Boolean)
    if (ids.length !== rows.length) return { success: false, error: `Filas sin id en ${table}` }

    // Aislamiento: ningún id puede pertenecer a otra empresa
    const foreign = table === 'producto_fotos'
      ? await db.findMany({ where: { id: { in: ids }, producto: { tenant_id: { not: tenantId } } }, select: { id: true } })
      : await db.findMany({ where: { id: { in: ids }, tenant_id: { not: tenantId } }, select: { id: true } })
    if (foreign.length) return { success: false, error: `Hay registros de ${table} que pertenecen a otra empresa` }

    if (table === 'producto_fotos') {
      const pids = [...new Set(rows.map((r) => r.producto_id))]
      const own = await prisma.productos.count({ where: { id: { in: pids }, tenant_id: tenantId } })
      if (own !== pids.length) return { success: false, error: 'Fotos de productos que no pertenecen a tu empresa' }
    }

    const clean = rows.map((r) => {
      const row = { ...r }
      for (const k of STRIP[table] ?? []) delete row[k]
      if (table !== 'producto_fotos') row.tenant_id = tenantId
      // Un ADMIN no puede crearse un SUPERADMIN vía backup
      if (table === 'usuarios' && row.rol === 'SUPERADMIN' && role !== 'SUPERADMIN') row.rol = 'ASESOR'
      return row
    })

    await prisma.$transaction(
      clean.map((row) => {
        const { id, ...rest } = row
        return db.upsert({ where: { id }, update: rest, create: row })
      }),
    )
    return { success: true, count: rows.length }
  } catch (e: any) {
    return { success: false, error: e.message as string }
  }
}

export async function finishImport() {
  for (const p of ['/dashboard', '/dashboard/inventario', '/dashboard/leads', '/dashboard/resenas', '/dashboard/entregas', '/dashboard/sedes', '/dashboard/usuarios', '/dashboard/perfil', '/catalogo']) revalidatePath(p)
}
