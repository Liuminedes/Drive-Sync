import { createClient } from '@/lib/supabase/server'
import { ResenasClient } from '@/components/resenas/resenas-client'

export const dynamic = 'force-dynamic'
const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function ResenasPage() {
  const supabase = await createClient()
  const { data: resenas } = await supabase
    .from('resenas')
    .select('*')
    .eq('tenant_id', DEMO_TENANT_ID)
    .order('created_at', { ascending: false })

  return <ResenasClient resenas={resenas || []} tenantId={DEMO_TENANT_ID} />
}
