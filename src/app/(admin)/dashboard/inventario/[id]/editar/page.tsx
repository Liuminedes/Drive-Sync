import { ProductForm } from '@/components/inventario/product-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { requireTenantSession } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { tenantId } = await requireTenantSession()
  const resolvedParams = await params

  // Asegura que solo se pueda ver y editar si pertenece a su propio tenant
  const producto = await prisma.productos.findFirst({
    where: { 
      id: resolvedParams.id,
      tenant_id: tenantId 
    },
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
          <h1 className="text-2xl font-bold tracking-tight">Editar Vehículo</h1>
          <p className="text-sm text-muted-foreground">Actualiza la información de {producto.titulo}.</p>
        </div>
      </div>

      <div className="mt-6">
        <ProductForm initialData={producto} />
      </div>
    </div>
  )
}
