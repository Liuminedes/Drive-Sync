import { createClient } from '@/lib/supabase/server'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { Car, DollarSign, Users } from 'lucide-react'

const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const [productosRes, leadsRes] = await Promise.all([
    supabase.from('productos').select('*').eq('tenant_id', DEMO_TENANT_ID),
    supabase.from('leads').select('*').eq('tenant_id', DEMO_TENANT_ID)
  ])

  const productos = productosRes.data || []
  const leads = leadsRes.data || []

  const totalVehiculos = productos.length
  const disponibles = productos.filter(p => p.estado === 'DISPONIBLE').length
  const valorInventario = productos
    .filter(p => p.estado === 'DISPONIBLE')
    .reduce((acc, curr) => acc + Number(curr.precio_venta), 0)
  
  const leadsNuevos = leads.filter(l => l.estado_lead === 'NUEVO').length

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Dashboard General</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Resumen de tu inventario y prospectos actuales.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        <KpiCard 
          title="Total Vehículos (Disponibles)"
          value={`${disponibles} / ${totalVehiculos}`}
          icon={<Car className="h-4 w-4 text-primary" />}
          description="Unidades listas para la venta."
        />
        <KpiCard 
          title="Valoración del Inventario"
          value={`$${valorInventario.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4 text-primary" />}
          description="Suma de precios de vehículos disponibles."
        />
        <KpiCard 
          title="Leads Nuevos"
          value={leadsNuevos}
          icon={<Users className="h-4 w-4 text-primary" />}
          description="Contactos sin gestionar desde el catálogo."
        />
      </div>

      <div className="mt-4 rounded-xl border border-border/60 bg-white dark:bg-background p-6 sm:p-8 text-center text-muted-foreground">
        <p className="text-sm">Gráficos y estadísticas detalladas próximamente.</p>
      </div>
    </div>
  )
}
