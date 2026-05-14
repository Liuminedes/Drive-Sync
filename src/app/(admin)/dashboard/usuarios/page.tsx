import { createClient } from '@/lib/supabase/server'
import { UsuariosClient } from '@/components/usuarios/usuarios-client'

const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function UsuariosPage() {
  const supabase = await createClient()
  
  const { data: usuarios, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('tenant_id', DEMO_TENANT_ID)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando usuarios:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios y Roles</h1>
          <p className="text-sm text-muted-foreground">Gestiona los accesos y roles de tu equipo (Admin, Asesor).</p>
        </div>
      </div>

      <UsuariosClient initialUsuarios={usuarios || []} tenantId={DEMO_TENANT_ID} />
    </div>
  )
}
