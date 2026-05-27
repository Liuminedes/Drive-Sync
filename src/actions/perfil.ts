'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function savePerfil(data: Record<string, string>, tenantId: string) {
  try {
    await prisma.perfil_asesor.upsert({
      where: { tenant_id: tenantId },
      update: data,
      create: { ...data, tenant_id: tenantId } as any
    })
    revalidatePath('/catalogo')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function uploadPerfilFile(
  formData: FormData,
  folder: string,
  tenantId: string,
  field: 'foto_url' | 'logo_empresa_url'
) {
  const file = formData.get('file') as File
  if (!file) return { success: false, error: 'No file' }

  const ext      = file.name.split('.').pop()
  const name     = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
  const path     = `${folder}/${name}`

  // Subir a Gigacore usando la API custom (upload.php)
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
    return { success: true, url: `https://intranet.almotores.com/CyD/wp-content/_api_media_test/${data.path}` };
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
