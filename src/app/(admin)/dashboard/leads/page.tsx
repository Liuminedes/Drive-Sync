import { createClient } from '@/lib/supabase/server'
import { LeadsClient } from '@/components/leads/leads-client'

export const dynamic = 'force-dynamic'

const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function LeadsPage() {
  const supabase = await createClient()

  // Primero intentamos con join a productos
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
      )
    `)
    .eq('tenant_id', DEMO_TENANT_ID)

  if (error) {
    // Si falla (ej: sin FK), cargamos sin join
    console.warn('Leads join falló, cargando sin relación:', error.message)
    const { data: plainLeads } = await supabase
      .from('leads')
      .select('*')
      .eq('tenant_id', DEMO_TENANT_ID)

    leads = plainLeads || []
  } else {
    leads = data || []
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CRM Prospectos (Leads)</h1>
          <p className="text-sm text-muted-foreground">Administra los contactos que llegan a través del catálogo web.</p>
        </div>
      </div>

      <LeadsClient initialLeads={leads} />
    </div>
  )
}
