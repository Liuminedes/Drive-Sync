'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireTenantSession } from '@/lib/tenant'
import { uploadImage } from '@/lib/media'

const PERFIL_FIELDS = ['nombre','cargo','concesionario','frase','telefono','email','instagram','linkedin','foto_url','anios_exp','ventas_realizadas','calificacion','logo_empresa_url']

export async function savePerfil(data: Record<string, string>) {
  try {
    const { tenantId } = await requireTenantSession()
    const clean = Object.fromEntries(Object.entries(data).filter(([k]) => PERFIL_FIELDS.includes(k)))
    await prisma.perfil_asesor.upsert({
      where: { tenant_id: tenantId },
      update: clean,
      create: { ...clean, tenant_id: tenantId } as any
    })
    revalidatePath('/catalogo')
    revalidatePath('/dashboard/perfil')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function uploadPerfilFile(
  formData: FormData,
  folder: string,
  _ignoredTenantId?: string,
  _field?: 'foto_url' | 'logo_empresa_url'
) {
  return uploadImage(formData, folder)
}
