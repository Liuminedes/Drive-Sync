'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteProducto(id: string) {
  try {
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
    const sedes = await prisma.sedes.findMany()
    return { success: true, data: sedes }
  } catch (error: any) {
    return { success: false, error: error.message, data: [] }
  }
}

export async function getAsesores() {
  try {
    const asesores = await prisma.usuarios.findMany({ where: { rol: 'ASESOR' } })
    return { success: true, data: asesores }
  } catch (error: any) {
    return { success: false, error: error.message, data: [] }
  }
}

export async function getProductoConFotos(id: string) {
  try {
    const producto = await prisma.productos.findUnique({
      where: { id },
      include: { producto_fotos: { orderBy: { orden: 'asc' } } }
    })
    return { success: true, data: producto }
  } catch (error: any) {
    return { success: false, error: error.message, data: null }
  }
}

export async function deleteProductoFoto(fotoId: string) {
  try {
    await prisma.producto_fotos.delete({ where: { id: fotoId } })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function saveProducto(data: Record<string, any>, isNew: boolean, tenantId: string) {
  try {
    const { id, fotos, ...rest } = data;
    
    if (isNew) {
      const newProd = await prisma.productos.create({
        data: {
          id,
          tenant_id: tenantId,
          ...rest,
        }
      });
      return { success: true, data: newProd }
    } else {
      const updated = await prisma.productos.update({
        where: { id },
        data: rest
      });
      return { success: true, data: updated }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function saveProductoFoto(fotoData: Record<string, any>) {
  try {
    await prisma.producto_fotos.create({
      data: fotoData as any
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateProductoFotos(fotos: { id: string; es_portada: boolean; orden: number }[]) {
  try {
    for (const foto of fotos) {
      await prisma.producto_fotos.update({
        where: { id: foto.id },
        data: { es_portada: foto.es_portada, orden: foto.orden }
      })
    }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function uploadProductoImage(formData: FormData, folder: string) {
  const file = formData.get('file') as File
  if (!file) return { success: false, error: 'No file' }

  const ext = file.name.split('.').pop()
  const name = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
  const path = `${folder}/${name}`

  const newFormData = new FormData();
  newFormData.append('file', file);
  newFormData.append('path', path);

  try {
    const response = await fetch('https://intranet.almotores.com/CyD/wp-content/_api_media_test/upload.php', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UPLOAD_SECRET_KEY}`
      },
      body: newFormData
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Error subiendo archivo: ${errorText}` };
    }

    const data = await response.json();
    return { success: true, path: data.path, url: `https://intranet.almotores.com/CyD/wp-content/_api_media_test/${data.path}` };
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
