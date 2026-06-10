import { prisma } from '@/lib/prisma'
import { EntregasClient } from '@/components/entregas/entregas-client'

export const dynamic = 'force-dynamic'
const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function EntregasPage() {
  const entregas = await prisma.entregas.findMany({
    where: { tenant_id: DEMO_TENANT_ID },
    orderBy: { created_at: 'desc' } // changed from fecha_entrega because schema.prisma doesn't have fecha_entrega, it has created_at
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

  return <EntregasClient entregas={mappedEntregas} tenantId={DEMO_TENANT_ID} />
}
