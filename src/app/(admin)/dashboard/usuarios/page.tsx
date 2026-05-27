import { prisma } from '@/lib/prisma'
import { UsuariosClient } from '@/components/usuarios/usuarios-client'

const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function UsuariosPage() {
  const usuarios = await prisma.usuarios.findMany({
    where: { tenant_id: DEMO_TENANT_ID },
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

      <UsuariosClient initialUsuarios={usuarios || []} tenantId={DEMO_TENANT_ID} />
    </div>
  )
}
