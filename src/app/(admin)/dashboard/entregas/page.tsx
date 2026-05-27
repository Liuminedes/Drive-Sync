import { prisma } from '@/lib/prisma'
import { EntregasClient } from '@/components/entregas/entregas-client'

export const dynamic = 'force-dynamic'
const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function EntregasPage() {
  const entregas = await prisma.entregas.findMany({
    where: { tenant_id: DEMO_TENANT_ID },
    orderBy: { created_at: 'desc' } // changed from fecha_entrega because schema.prisma doesn't have fecha_entrega, it has created_at
  })

  return <EntregasClient entregas={(entregas as any) || []} tenantId={DEMO_TENANT_ID} />
}
