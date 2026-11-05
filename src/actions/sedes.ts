'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/tenant'

export async function createSede(data: Record<string, any>) {
  try {
    const { tenantId } = await requireRole('ADMIN')
    await prisma.sedes.create({
      data: {
        nombre: data.nombre,
        ciudad: data.ciudad,
        direccion: data.direccion,
        tenant_id: tenantId
      }
    })
    revalidatePath('/dashboard/sedes')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateSede(id: string, data: Record<string, any>) {
  try {
    const { tenantId } = await requireRole('ADMIN')

    const sede = await prisma.sedes.findFirst({
      where: { id, tenant_id: tenantId }
    })

    if (!sede) {
      return { success: false, error: 'Sede no encontrada o no autorizada' }
    }

    await prisma.sedes.update({
      where: { id },
      data: {
        nombre: data.nombre,
        ciudad: data.ciudad,
        direccion: data.direccion
      }
    })
    revalidatePath('/dashboard/sedes')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteSede(id: string) {
  try {
    const { tenantId } = await requireRole('ADMIN')

    const sede = await prisma.sedes.findFirst({
      where: { id, tenant_id: tenantId }
    })

    if (!sede) {
      return { success: false, error: 'Sede no encontrada o no autorizada' }
    }

    await prisma.sedes.delete({ where: { id } })
    revalidatePath('/dashboard/sedes')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
