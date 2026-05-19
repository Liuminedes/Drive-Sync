import { createClient } from '@/lib/supabase/server'
import { EntregasClient } from '@/components/entregas/entregas-client'

export const dynamic = 'force-dynamic'
const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function EntregasPage() {
  const supabase = await createClient()
  const { data: entregas } = await supabase
    .from('entregas')
    .select('*')
    .eq('tenant_id', DEMO_TENANT_ID)
    .order('fecha_entrega', { ascending: false })

  return <EntregasClient entregas={entregas || []} tenantId={DEMO_TENANT_ID} />
}
