import { prisma } from '@/lib/prisma'
import { ResenasClient } from '@/components/resenas/resenas-client'

export const dynamic = 'force-dynamic'
const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function ResenasPage() {
  const resenas = await prisma.resenas.findMany({
    where: { tenant_id: DEMO_TENANT_ID },
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

  return <ResenasClient resenas={mappedResenas} tenantId={DEMO_TENANT_ID} />
}
