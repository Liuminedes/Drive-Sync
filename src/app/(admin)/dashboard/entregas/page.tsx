import { prisma } from '@/lib/prisma'
import { EntregasClient } from '@/components/entregas/entregas-client'
import { requireTenantSession } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export default async function EntregasPage() {
  const { tenantId } = await requireTenantSession()

  const entregas = await prisma.entregas.findMany({
    where: { tenant_id: tenantId },
    orderBy: { created_at: 'desc' }
  })

  const mappedEntregas = entregas.map(e => {
    let extra: any = {}
    try { extra = typeof e.fotos === 'string' ? JSON.parse(e.fotos) : (e.fotos || {}) } catch(err){}
    return {
      id: e.id,
      tenant_id: e.tenant_id,
      cliente_nombre: e.titulo || '',
      vehiculo: extra?.vehiculo || '',
      fecha_entrega: extra?.fecha_entrega || e.created_at?.toISOString() || '',
      foto_principal: extra?.foto_principal || '',
      fotos_extra: extra?.fotos_extra || '[]',
      nota: e.descripcion || '',
      visible: e.visible ?? true
    }
  })

  return <EntregasClient entregas={mappedEntregas} tenantId={tenantId} />
}
