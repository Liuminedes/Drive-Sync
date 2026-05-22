import { createClient } from '@/lib/supabase/server'
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
  const supabase = await createClient()
  
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1
  const search = typeof searchParams.q === 'string' ? searchParams.q : ''
  const estado = typeof searchParams.estado === 'string' ? searchParams.estado : 'TODOS'

  const pageSize = 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('productos')
    .select(`
      *,
      producto_fotos (url, es_portada)
    `, { count: 'exact' })
    .eq('tenant_id', DEMO_TENANT_ID)

  if (search) {
    query = query.ilike('titulo', `%${search}%`)
  }

  if (estado && estado !== 'TODOS') {
    query = query.eq('estado', estado)
  }

  const { data: productos, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error cargando inventario:', error)
  }

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
