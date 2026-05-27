import { ProductForm } from '@/components/inventario/product-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params

  const producto = await prisma.productos.findUnique({
    where: { id: resolvedParams.id },
    include: {
      producto_fotos: {
        orderBy: { orden: 'asc' }
      }
    }
  })

  if (!producto) {
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
