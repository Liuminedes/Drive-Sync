import { ProductForm } from '@/components/inventario/product-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: producto, error } = await supabase
    .from('productos')
    .select(`
      *,
      producto_fotos (*)
    `)
    .eq('id', resolvedParams.id)
    .single()

  // Ordenar fotos por el campo 'orden'
  if (producto?.producto_fotos) {
    producto.producto_fotos.sort((a: any, b: any) => (a.orden ?? 0) - (b.orden ?? 0))
  }

  if (error || !producto) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/inventario" className="p-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Producto</h1>
          <p className="text-sm text-muted-foreground">Actualiza la información de {producto.titulo}.</p>
        </div>
      </div>

      <div className="mt-6">
        <ProductForm initialData={producto} />
      </div>
    </div>
  )
}
