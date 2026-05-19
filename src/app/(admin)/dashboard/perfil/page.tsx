import { createClient } from '@/lib/supabase/server'
import { PerfilClient } from '@/components/perfil/perfil-client'

export const dynamic = 'force-dynamic'
const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: perfil } = await supabase
    .from('perfil_asesor')
    .select('*')
    .eq('tenant_id', DEMO_TENANT_ID)
    .single()

  return <PerfilClient perfil={perfil} tenantId={DEMO_TENANT_ID} />
}
