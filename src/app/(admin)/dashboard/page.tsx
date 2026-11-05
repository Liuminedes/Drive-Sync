import { prisma } from '@/lib/prisma'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { Car, DollarSign, Users, Sparkles } from 'lucide-react'
import { requireTenantSession } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { tenantId, name } = await requireTenantSession()

  const [totalVehiculos, disponibles, valor, leadsPorEstado] = await Promise.all([
    prisma.productos.count({ where: { tenant_id: tenantId } }),
    prisma.productos.count({ where: { tenant_id: tenantId, estado: 'DISPONIBLE' } }),
    prisma.productos.aggregate({ where: { tenant_id: tenantId, estado: 'DISPONIBLE' }, _sum: { precio_venta: true } }),
    prisma.leads.groupBy({ by: ['estado'], where: { tenant_id: tenantId }, _count: { _all: true } }),
  ])
  const valorInventario = Number(valor._sum.precio_venta ?? 0)
  const nLeads = (e: string) => leadsPorEstado.find((l) => l.estado === e)?._count._all ?? 0
  const leadsNuevos = nLeads('NUEVO')
  const leadsEnSeguimiento = nLeads('EN_SEGUIMIENTO')
  const leadsConvertidos = nLeads('CONVERTIDO')

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Dashboard General</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Bienvenido, <span className="font-semibold text-foreground">{name}</span>. Resumen en tiempo real de tu concesionario.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        <KpiCard 
          title="Vehículos Disponibles"
          value={`${disponibles} / ${totalVehiculos}`}
          icon={<Car className="h-4 w-4 text-primary" />}
          description="Unidades activas para la venta en catálogo."
        />
        <KpiCard 
          title="Valoración del Inventario"
          value={`$${valorInventario.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4 text-primary" />}
          description="Suma de precios de vehículos disponibles."
        />
        <KpiCard 
          title="Leads Nuevos por Gestionar"
          value={leadsNuevos}
          icon={<Users className="h-4 w-4 text-primary" />}
          description={`${leadsEnSeguimiento} en seguimiento | ${leadsConvertidos} ventas cerradas`}
        />
      </div>

      <div className="rounded-xl border border-border/60 bg-gradient-to-r from-blue-50/50 via-white to-slate-50 dark:from-background dark:to-muted/20 p-6 sm:p-8 flex items-start gap-4 shadow-sm">
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold tracking-tight text-base">WhatsApp Hub & Pipeline Comercial Activo</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Tu concesionario está aislado y protegido. Recuerda utilizar mensajes predefinidos y respuestas inbound para mantener la máxima reputación de tus líneas comerciales.
          </p>
        </div>
      </div>
    </div>
  )
}
