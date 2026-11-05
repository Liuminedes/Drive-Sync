import { prisma } from '@/lib/prisma'
import { SedesClient } from '@/components/sedes/sedes-client'
import { requireTenantSession } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export default async function SedesPage() {
  const { tenantId } = await requireTenantSession()

  const sedes = await prisma.sedes.findMany({
    where: { tenant_id: tenantId },
    orderBy: { created_at: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Sedes y Ubicaciones</h1>
          <p className="text-sm text-muted-foreground">Gestiona los puntos de venta físicos de tu inventario.</p>
        </div>
      </div>

      <SedesClient initialSedes={(sedes as any) || []} tenantId={tenantId} />
    </div>
  )
}
