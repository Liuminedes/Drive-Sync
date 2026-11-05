import { prisma } from '@/lib/prisma'
import { UsuariosClient } from '@/components/usuarios/usuarios-client'
import { requireTenantSession } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  const { tenantId } = await requireTenantSession()

  const usuarios = await prisma.usuarios.findMany({
    where: { tenant_id: tenantId },
    orderBy: { created_at: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Usuarios y Roles</h1>
          <p className="text-sm text-muted-foreground">Gestiona los accesos y roles de tu equipo (Admin, Asesor).</p>
        </div>
      </div>

      <UsuariosClient initialUsuarios={(usuarios as any) || []} tenantId={tenantId} />
    </div>
  )
}
