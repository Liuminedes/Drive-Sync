'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function savePerfil(data: Record<string, string>, tenantId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('perfil_asesor')
    .upsert({ ...data, tenant_id: tenantId }, { onConflict: 'tenant_id' })

  if (error) return { success: false, error: error.message }
  revalidatePath('/catalogo')
  return { success: true }
}

export async function uploadPerfilFile(
  formData: FormData,
  folder: string,
  tenantId: string,
  field: 'foto_url' | 'logo_empresa_url'
) {
  const supabase = createAdminClient()
  const file = formData.get('file') as File
  if (!file) return { success: false, error: 'No file' }

  const ext      = file.name.split('.').pop()
  const name     = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
  const path     = `${folder}/${name}`
  const bytes    = await file.arrayBuffer()

  const { error: upErr } = await supabase.storage
    .from('drive-sync-media')
    .upload(path, bytes, { contentType: file.type })
  if (upErr) return { success: false, error: upErr.message }

  const { data } = supabase.storage.from('drive-sync-media').getPublicUrl(path)
  return { success: true, url: data.publicUrl }
}
