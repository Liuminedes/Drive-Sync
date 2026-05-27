import { prisma } from '@/lib/prisma'
import { ProductTable } from '@/components/inventario/product-table'
import { InventoryFilters } from '@/components/inventario/inventory-filters'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function InventarioPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1
  const search = typeof searchParams.q === 'string' ? searchParams.q : ''
  const estado = typeof searchParams.estado === 'string' ? searchParams.estado : 'TODOS'

  const pageSize = 10
  const skip = (page - 1) * pageSize

  const whereCondition: any = {
    tenant_id: DEMO_TENANT_ID,
  }

  if (search) {
    whereCondition.titulo = { contains: search }
  }

  if (estado && estado !== 'TODOS') {
    whereCondition.estado = estado
  }

  const [productos, count] = await Promise.all([
    prisma.productos.findMany({
      where: whereCondition,
      include: {
        producto_fotos: {
          select: { url: true, es_portada: true }
        }
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.productos.count({ where: whereCondition })
  ])

  const totalPages = count ? Math.ceil(count / pageSize) : 1

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Inventario</h1>
          <p className="text-sm text-muted-foreground mt-0.5 hidden sm:block">Gestiona los vehículos y productos de tu catálogo.</p>
        </div>
        <Link href="/dashboard/inventario/nuevo" className="shrink-0">
          <Button className="h-9 gap-2 text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Producto</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </Link>
      </div>

      <InventoryFilters />

      <ProductTable productos={productos || []} currentPage={page} totalPages={totalPages} />
    </div>
  )
}
