import { prisma } from '@/lib/prisma'
import { SedesClient } from '@/components/sedes/sedes-client'

const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function SedesPage() {
  const sedes = await prisma.sedes.findMany({
    where: { tenant_id: DEMO_TENANT_ID },
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

      <SedesClient initialSedes={sedes || []} tenantId={DEMO_TENANT_ID} />
    </div>
  )
}
