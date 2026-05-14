import { createClient } from '@/lib/supabase/server'
import { ProductTable } from '@/components/inventario/product-table'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function InventarioPage() {
  const supabase = await createClient()
  
  const { data: productos, error } = await supabase
    .from('productos')
    .select(`
      *,
      producto_fotos (url, es_portada)
    `)
    .eq('tenant_id', DEMO_TENANT_ID)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando inventario:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventario</h1>
          <p className="text-sm text-muted-foreground">Gestiona los vehículos y productos de tu catálogo.</p>
        </div>
        <Link href="/dashboard/inventario/nuevo">
          <Button className="h-9 gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      <ProductTable 
        productos={productos || []} 
        // En un caso real, onDelete sería una Server Action o llamar a un endpoint de API
        onDelete={async (id) => {
          'use server'
          // lógica de eliminación...
          // await supabase.from('productos').delete().eq('id', id)
        }} 
      />
    </div>
  )
}
