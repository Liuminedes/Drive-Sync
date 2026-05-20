import { createClient } from '@supabase/supabase-js'

/**
 * Cliente admin — bypasa RLS.
 * Usa SUPABASE_SERVICE_ROLE_KEY si está disponible,
 * cae al anon key en local si no está configurada.
 * 
 * En local: agrega en .env.local → SUPABASE_SERVICE_ROLE_KEY=eyJ...
 * En Vercel: Project Settings → Environment Variables → SUPABASE_SERVICE_ROLE_KEY
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!serviceKey) {
    console.warn('[admin] SUPABASE_SERVICE_ROLE_KEY no configurada — usando anon key (RLS activo)')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey || anonKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
