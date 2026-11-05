'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireTenantSession } from '@/lib/tenant'
import { uploadImage } from '@/lib/media'

export async function deleteProducto(id: string) {
  try {
    const { tenantId } = await requireTenantSession()
    
    // Verificamos que el producto pertenezca al tenant del usuario antes de borrarlo
    const producto = await prisma.productos.findFirst({
      where: { id, tenant_id: tenantId }
    })

    if (!producto) {
      return { success: false, error: 'Producto no encontrado o no autorizado' }
    }

    await prisma.productos.delete({ where: { id } })
    revalidatePath('/dashboard/inventario')
    revalidatePath('/catalogo')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getSedes() {
  try {
    const { tenantId } = await requireTenantSession()
    const sedes = await prisma.sedes.findMany({
      where: { tenant_id: tenantId },
      orderBy: { nombre: 'asc' }
    })
    return { success: true, data: sedes }
  } catch (error: any) {
    return { success: false, error: error.message, data: [] }
  }
}

export async function getAsesores() {
  try {
    const { tenantId } = await requireTenantSession()
    const asesores = await prisma.usuarios.findMany({ 
      where: { tenant_id: tenantId, rol: 'ASESOR' },
      orderBy: { nombre_completo: 'asc' }
    })
    return { success: true, data: asesores }
  } catch (error: any) {
    return { success: false, error: error.message, data: [] }
  }
}

export async function getProductoConFotos(id: string) {
  try {
    const { tenantId } = await requireTenantSession()
    const producto = await prisma.productos.findFirst({
      where: { id, tenant_id: tenantId },
      include: { producto_fotos: { orderBy: { orden: 'asc' } } }
    })

    if (!producto) {
      return { success: false, error: 'Producto no encontrado o sin permisos', data: null }
    }

    return { success: true, data: producto }
  } catch (error: any) {
    return { success: false, error: error.message, data: null }
  }
}

export async function deleteProductoFoto(fotoId: string) {
  try {
    const { tenantId } = await requireTenantSession()

    // Validamos pertenencia del producto al tenant
    const foto = await prisma.producto_fotos.findUnique({
      where: { id: fotoId },
      include: { producto: { select: { tenant_id: true } } }
    })

    if (!foto || foto.producto?.tenant_id !== tenantId) {
      return { success: false, error: 'Foto no encontrada o no autorizada' }
    }

    await prisma.producto_fotos.delete({ where: { id: fotoId } })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

const PRODUCTO_FIELDS = ['sede_id','categoria','titulo','descripcion','precio_venta','moneda','estado','detalles','destacado','asesor_id']

export async function saveProducto(data: Record<string, any>, isNew: boolean, _customTenantId?: string) {
  try {
    const session = await requireTenantSession()
    // Usamos el tenant_id autenticado inmutablemente
    const tenantId = session.tenantId

    const { id } = data
    const rest = Object.fromEntries(Object.entries(data).filter(([k]) => PRODUCTO_FIELDS.includes(k)))

    if (isNew) {
      const newProd = await prisma.productos.create({
        data: {
          id: id || undefined,
          tenant_id: tenantId,
          ...rest,
        } as any
      })
      revalidatePath('/dashboard/inventario')
      revalidatePath('/catalogo')
      return { success: true, data: newProd }
    } else {
      // Validar pertenencia antes de actualizar
      const existing = await prisma.productos.findFirst({
        where: { id, tenant_id: tenantId }
      })

      if (!existing) {
        return { success: false, error: 'Producto no existe o no pertenece a tu concesionario' }
      }

      const updated = await prisma.productos.update({
        where: { id },
        data: rest
      })
      revalidatePath('/dashboard/inventario')
      revalidatePath('/catalogo')
      return { success: true, data: updated }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function saveProductoFoto(fotoData: Record<string, any>) {
  try {
    const { tenantId } = await requireTenantSession()

    // Validar que el producto al que pertenece la foto sea de este tenant
    const producto = await prisma.productos.findFirst({
      where: { id: fotoData.producto_id, tenant_id: tenantId }
    })

    if (!producto) {
      return { success: false, error: 'Operación no permitida en este vehículo' }
    }

    await prisma.producto_fotos.create({
      data: {
        producto_id: fotoData.producto_id,
        url: fotoData.url,
        es_portada: !!fotoData.es_portada,
        orden: Number(fotoData.orden) || 0,
      }
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateProductoFotos(fotos: { id: string; es_portada: boolean; orden: number }[]) {
  try {
    const { tenantId } = await requireTenantSession()

    for (const foto of fotos) {
      const fotoObj = await prisma.producto_fotos.findUnique({
        where: { id: foto.id },
        include: { producto: { select: { tenant_id: true } } }
      })

      if (fotoObj && fotoObj.producto?.tenant_id === tenantId) {
        await prisma.producto_fotos.update({
          where: { id: foto.id },
          data: { es_portada: foto.es_portada, orden: foto.orden }
        })
      }
    }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function uploadProductoImage(formData: FormData, folder: string) {
  return uploadImage(formData, folder)
}
