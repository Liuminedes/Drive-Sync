'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createLead(data: Record<string, any>) {
  try {
    await prisma.leads.create({ data: data as any })
    revalidatePath('/dashboard/leads')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateLeadEstado(leadId: string, estado_lead: string, productoId?: string, estado_producto?: string) {
  try {
    await prisma.leads.update({
      where: { id: leadId },
      data: { estado: estado_lead }
    })
    
    if (productoId && estado_producto) {
      await prisma.productos.update({
        where: { id: productoId },
        data: { estado: estado_producto }
      })
    }
    
    revalidatePath('/dashboard/leads')
    revalidatePath('/catalogo')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function assignLeadAsesor(leadId: string, asesorId: string | null) {
  try {
    await prisma.leads.update({
      where: { id: leadId },
      data: { atendido_por: asesorId }
    })
    revalidatePath('/dashboard/leads')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteLead(leadId: string) {
  try {
    await prisma.leads.delete({ where: { id: leadId } })
    revalidatePath('/dashboard/leads')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
