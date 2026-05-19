import { createClient } from '@/lib/supabase/server'
import { SedesClient } from '@/components/sedes/sedes-client'

const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function SedesPage() {
  const supabase = await createClient()
  
  const { data: sedes, error } = await supabase
    .from('sedes')
    .select('*')
    .eq('tenant_id', DEMO_TENANT_ID)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando sedes:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Sedes y Ubicaciones</h1>
          <p className="text-sm text-muted-foreground">Gestiona los puntos de venta físicos de tu inventario.</p>
        </div>
      </div>

      <SedesClient initialSedes={sedes || []} tenantId={DEMO_TENANT_ID} />
    </div>
  )
}
