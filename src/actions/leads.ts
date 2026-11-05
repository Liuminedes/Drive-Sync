'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireTenantSession, getTenantSession } from '@/lib/tenant'

export async function createLead(data: Record<string, any>) {
  try {
    // Si viene de formulario público o catálogo, requiere tenant_id en payload o sesión
    let tenantId = data.tenant_id

    if (!tenantId) {
      const session = await getTenantSession()
      tenantId = session?.tenantId
    }

    if (!tenantId) {
      return { success: false, error: 'Identificador de concesionario no especificado' }
    }

    const tenant = await prisma.tenants.findUnique({ where: { id: tenantId }, select: { id: true } })
    if (!tenant) return { success: false, error: 'Concesionario no válido' }

    let producto_id: string | null = data.producto_id || null
    if (producto_id) {
      const prod = await prisma.productos.findFirst({ where: { id: producto_id, tenant_id: tenantId }, select: { id: true } })
      if (!prod) producto_id = null
    }

    // Lista blanca: el catálogo envía nombre_cliente/email_cliente/telefono_cliente
    const nombre = String(data.nombre ?? data.nombre_cliente ?? '').slice(0, 150)
    const telefono = String(data.telefono ?? data.telefono_cliente ?? '').slice(0, 40)
    if (!nombre || !telefono) return { success: false, error: 'Nombre y teléfono son obligatorios' }
    const payload = {
      tenant_id: tenantId,
      producto_id,
      nombre,
      telefono,
      email: String(data.email ?? data.email_cliente ?? '').slice(0, 150) || null,
      origen: String(data.origen || 'CATALOGO_PUBLICO').slice(0, 50),
      estado: 'NUEVO',
    }

    await prisma.leads.create({ data: payload })
    revalidatePath('/dashboard/leads')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateLeadEstado(leadId: string, estado_lead: string, productoId?: string, estado_producto?: string) {
  try {
    const { tenantId } = await requireTenantSession()

    // Validar que el lead pertenezca al tenant del usuario autenticado
    const lead = await prisma.leads.findFirst({
      where: { id: leadId, tenant_id: tenantId }
    })

    if (!lead) {
      return { success: false, error: 'Lead no encontrado o no autorizado' }
    }

    await prisma.leads.update({
      where: { id: leadId },
      data: { estado: estado_lead }
    })
    
    // Si se pasa vehículo para sincronización de inventario, validar pertenencia
    if (productoId && estado_producto) {
      const prod = await prisma.productos.findFirst({
        where: { id: productoId, tenant_id: tenantId }
      })

      if (prod) {
        await prisma.productos.update({
          where: { id: productoId },
          data: { estado: estado_producto }
        })
      }
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
    const { tenantId } = await requireTenantSession()

    const lead = await prisma.leads.findFirst({
      where: { id: leadId, tenant_id: tenantId }
    })

    if (!lead) {
      return { success: false, error: 'Lead no encontrado o no autorizado' }
    }

    if (asesorId) {
      const asesor = await prisma.usuarios.findFirst({
        where: { id: asesorId, tenant_id: tenantId }
      })
      if (!asesor) {
        return { success: false, error: 'Asesor no pertenece a tu concesionario' }
      }
    }

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
    const { tenantId } = await requireTenantSession()

    const lead = await prisma.leads.findFirst({
      where: { id: leadId, tenant_id: tenantId }
    })

    if (!lead) {
      return { success: false, error: 'Lead no encontrado o no autorizado' }
    }

    await prisma.leads.delete({ where: { id: leadId } })
    revalidatePath('/dashboard/leads')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
