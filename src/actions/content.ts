'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function toggleVisibleResena(id: string, visible: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('resenas').update({ visible }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/resenas')
  revalidatePath('/catalogo')
  return { success: true }
}

export async function deleteResena(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('resenas').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/resenas')
  revalidatePath('/catalogo')
  return { success: true }
}

export async function upsertResena(data: Record<string, any>, tenantId: string) {
  const supabase = createAdminClient()
  const payload = { ...data, tenant_id: tenantId }
  const { error } = data.id
    ? await supabase.from('resenas').update(payload).eq('id', data.id)
    : await supabase.from('resenas').insert(payload)
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/resenas')
  revalidatePath('/catalogo')
  return { success: true }
}

export async function toggleVisibleEntrega(id: string, visible: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('entregas').update({ visible }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/entregas')
  revalidatePath('/catalogo')
  return { success: true }
}

export async function deleteEntrega(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('entregas').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/entregas')
  revalidatePath('/catalogo')
  return { success: true }
}

export async function upsertEntrega(data: Record<string, any>, tenantId: string) {
  const supabase = createAdminClient()
  const payload = { ...data, tenant_id: tenantId }
  const { error } = data.id
    ? await supabase.from('entregas').update(payload).eq('id', data.id)
    : await supabase.from('entregas').insert(payload)
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/entregas')
  revalidatePath('/catalogo')
  return { success: true }
}
