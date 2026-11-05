import { prisma } from '@/lib/prisma'
import { ResenasClient } from '@/components/resenas/resenas-client'
import { requireTenantSession } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export default async function ResenasPage() {
  const { tenantId } = await requireTenantSession()

  const resenas = await prisma.resenas.findMany({
    where: { tenant_id: tenantId },
    orderBy: { created_at: 'desc' }
  })

  const mappedResenas = resenas.map(r => {
    let extra: any = {}
    try { extra = typeof r.fotos === 'string' ? JSON.parse(r.fotos) : (r.fotos || {}) } catch(e){}
    return {
      id: r.id,
      tenant_id: r.tenant_id,
      nombre_cliente: r.titulo || '',
      vehiculo_comprado: extra?.vehiculo_comprado || '',
      texto: r.contenido || '',
      estrellas: extra?.estrellas || 5,
      foto_url: extra?.foto_url || '',
      visible: r.visible ?? true,
      created_at: r.created_at?.toISOString() || ''
    }
  })

  return <ResenasClient resenas={mappedResenas} tenantId={tenantId} />
}
