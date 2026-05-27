import { prisma } from '@/lib/prisma'
import { PerfilClient } from '@/components/perfil/perfil-client'

export const dynamic = 'force-dynamic'
const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function PerfilPage() {
  const perfil = await prisma.perfil_asesor.findUnique({
    where: { tenant_id: DEMO_TENANT_ID }
  })

  return <PerfilClient perfil={perfil as any} tenantId={DEMO_TENANT_ID} />
}
