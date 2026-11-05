import { prisma } from '@/lib/prisma'
import { LeadsClient } from '@/components/leads/leads-client'
import { requireTenantSession } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

// La BD guarda nombre/email/telefono/estado; el componente usa los nombres del esquema anterior.
const toClientLead = (l: any) => ({
  ...l,
  nombre_cliente: l.nombre ?? '',
  email_cliente: l.email ?? null,
  telefono_cliente: l.telefono ?? '',
  estado_lead: l.estado ?? 'NUEVO',
})

export default async function LeadsPage() {
  const { tenantId } = await requireTenantSession()
  let leads: any[] = []
  
  try {
    leads = await prisma.leads.findMany({
      where: { tenant_id: tenantId },
      include: {
        productos: {
          select: {
            titulo: true,
            precio_venta: true,
            categoria: true,
            producto_fotos: {
              select: { url: true, es_portada: true }
            }
          }
        },
        usuarios: {
          select: {
            nombre_completo: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })
  } catch (error: any) {
    console.warn('Leads join falló, cargando sin relación:', error.message)
    leads = await prisma.leads.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' }
    })
  }

  const asesores = await prisma.usuarios.findMany({
    where: { tenant_id: tenantId },
    select: { id: true, nombre_completo: true }
  })

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">CRM Prospectos (Leads)</h1>
        <p className="text-sm text-muted-foreground mt-0.5 hidden sm:block">Administra y contacta a los interesados en tus vehículos.</p>
      </div>
      <LeadsClient initialLeads={leads.map(toClientLead)} asesores={asesores || []} />
    </div>
  )
}
