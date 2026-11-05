import { prisma } from '@/lib/prisma'
import { MEDIA_BASE } from '@/lib/media'

export const BACKUP_VERSION = 1

/** Todos los datos de una empresa, tal cual están en la BD (incluye password_hash). */
export async function buildBackupData(tenantId: string) {
  const [tenant, perfil, usuarios, sedes, productos, resenas, entregas, leads] = await Promise.all([
    prisma.tenants.findUnique({ where: { id: tenantId } }),
    prisma.perfil_asesor.findUnique({ where: { tenant_id: tenantId } }),
    prisma.usuarios.findMany({ where: { tenant_id: tenantId } }),
    prisma.sedes.findMany({ where: { tenant_id: tenantId } }),
    prisma.productos.findMany({ where: { tenant_id: tenantId }, include: { producto_fotos: true } }),
    prisma.resenas.findMany({ where: { tenant_id: tenantId } }),
    prisma.entregas.findMany({ where: { tenant_id: tenantId } }),
    prisma.leads.findMany({ where: { tenant_id: tenantId } }),
  ])
  return {
    meta: { version: BACKUP_VERSION, exported_at: new Date().toISOString(), system: 'DriveSync' },
    tenant, perfil, usuarios, sedes, productos, resenas, entregas, leads,
  }
}

/** URLs de nuestro hosting de medios que aparecen en cualquier parte del JSON (incluye JSON anidado como texto). */
export function findMediaUrls(text: string): string[] {
  const re = new RegExp(`${MEDIA_BASE.replace(/[.*+?^${}()|[\]\/]/g, '\$&')}/[^"\\\s]+`, 'g')
  return [...new Set(text.match(re) ?? [])]
}
