'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateSede(id: string, data: Record<string, any>) {
  try {
    await prisma.sedes.update({ where: { id }, data: data as any })
    revalidatePath('/dashboard/sedes')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createSede(data: Record<string, any>, tenantId: string) {
  try {
    await prisma.sedes.create({ data: { ...data, tenant_id: tenantId } as any })
    revalidatePath('/dashboard/sedes')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteSede(id: string) {
  try {
    await prisma.sedes.delete({ where: { id } })
    revalidatePath('/dashboard/sedes')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
