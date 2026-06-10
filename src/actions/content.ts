'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function toggleVisibleResena(id: string, visible: boolean) {
  try {
    await prisma.resenas.update({ where: { id }, data: { visible } })
    revalidatePath('/dashboard/resenas')
    revalidatePath('/catalogo')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteResena(id: string) {
  try {
    await prisma.resenas.delete({ where: { id } })
    revalidatePath('/dashboard/resenas')
    revalidatePath('/catalogo')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function upsertResena(data: Record<string, any>, tenantId: string) {
  try {
    const payload: any = {
      tenant_id: tenantId,
      titulo: data.nombre_cliente,
      contenido: data.texto,
      visible: data.visible !== undefined ? data.visible : true,
      fotos: JSON.stringify({
        foto_url: data.foto_url,
        estrellas: data.estrellas,
        vehiculo_comprado: data.vehiculo_comprado
      })
    }
    if (data.id) {
      await prisma.resenas.update({ where: { id: data.id }, data: payload })
    } else {
      await prisma.resenas.create({ data: payload })
    }
    revalidatePath('/dashboard/resenas')
    revalidatePath('/catalogo')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function toggleVisibleEntrega(id: string, visible: boolean) {
  try {
    await prisma.entregas.update({ where: { id }, data: { visible } })
    revalidatePath('/dashboard/entregas')
    revalidatePath('/catalogo')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteEntrega(id: string) {
  try {
    await prisma.entregas.delete({ where: { id } })
    revalidatePath('/dashboard/entregas')
    revalidatePath('/catalogo')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function upsertEntrega(data: Record<string, any>, tenantId: string) {
  try {
    const payload: any = {
      tenant_id: tenantId,
      titulo: data.cliente_nombre,
      descripcion: data.nota,
      visible: data.visible !== undefined ? data.visible : true,
      fotos: JSON.stringify({
        foto_principal: data.foto_principal,
        fotos_extra: data.fotos_extra,
        vehiculo: data.vehiculo,
        fecha_entrega: data.fecha_entrega
      })
    }
    if (data.id) {
      await prisma.entregas.update({ where: { id: data.id }, data: payload })
    } else {
      await prisma.entregas.create({ data: payload })
    }
    revalidatePath('/dashboard/entregas')
    revalidatePath('/catalogo')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
