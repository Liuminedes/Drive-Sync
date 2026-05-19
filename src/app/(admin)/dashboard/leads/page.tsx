import { createClient } from '@/lib/supabase/server'
import { LeadsClient } from '@/components/leads/leads-client'

export const dynamic = 'force-dynamic'

const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function LeadsPage() {
  const supabase = await createClient()

  let leads: any[] = []
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      productos (
        titulo,
        precio_venta,
        categoria,
        producto_fotos (url, es_portada)
      ),
      usuarios!leads_atendido_por_fkey (
        nombre_completo
      )
    `)
    .eq('tenant_id', DEMO_TENANT_ID)

  if (error) {
    console.warn('Leads join falló, cargando sin relación:', error.message)
    const { data: plainLeads } = await supabase
      .from('leads')
      .select('*')
      .eq('tenant_id', DEMO_TENANT_ID)
    leads = plainLeads || []
  } else {
    leads = data || []
  }

  const { data: asesores } = await supabase
    .from('usuarios')
    .select('id, nombre_completo')
    .eq('tenant_id', DEMO_TENANT_ID)

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">CRM Prospectos (Leads)</h1>
        <p className="text-sm text-muted-foreground mt-0.5 hidden sm:block">Administra los contactos que llegan a través del catálogo web.</p>
      </div>
      <LeadsClient initialLeads={leads} asesores={asesores || []} />
    </div>
  )
}
