import { prisma } from '@/lib/prisma'
import { PerfilClient } from '@/components/perfil/perfil-client'
import { BackupPanel } from '@/components/backup/backup-panel'
import { requireTenantSession } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const { tenantId, role } = await requireTenantSession()

  const perfil = await prisma.perfil_asesor.findUnique({
    where: { tenant_id: tenantId }
  })

  return (
    <div className="space-y-6">
      <PerfilClient perfil={perfil as any} tenantId={tenantId} />
      {['ADMIN', 'SUPERADMIN'].includes(role) && <BackupPanel />}
    </div>
  )
}
