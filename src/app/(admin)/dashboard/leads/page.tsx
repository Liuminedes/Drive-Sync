import { prisma } from '@/lib/prisma'
import { LeadsClient } from '@/components/leads/leads-client'

export const dynamic = 'force-dynamic'

const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function LeadsPage() {
  let leads: any[] = []
  
  try {
    leads = await prisma.leads.findMany({
      where: { tenant_id: DEMO_TENANT_ID },
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
      }
    })
  } catch (error: any) {
    console.warn('Leads join falló, cargando sin relación:', error.message)
    leads = await prisma.leads.findMany({
      where: { tenant_id: DEMO_TENANT_ID }
    })
  }

  const asesores = await prisma.usuarios.findMany({
    where: { tenant_id: DEMO_TENANT_ID },
    select: { id: true, nombre_completo: true }
  })

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">CRM Prospectos (Leads)</h1>
        <p className="text-sm text-muted-foreground mt-0.5 hidden sm:block">Administra los contactos que llegan a través del catálogo web.</p>
      </div>
      <LeadsClient initialLeads={leads} asesores={asesores || []} />
    </div>
  )
}
