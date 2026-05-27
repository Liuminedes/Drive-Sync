import { prisma } from '@/lib/prisma'
import { ResenasClient } from '@/components/resenas/resenas-client'

export const dynamic = 'force-dynamic'
const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function ResenasPage() {
  const resenas = await prisma.resenas.findMany({
    where: { tenant_id: DEMO_TENANT_ID },
    orderBy: { created_at: 'desc' }
  })

  return <ResenasClient resenas={resenas || []} tenantId={DEMO_TENANT_ID} />
}
