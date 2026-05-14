import { ProductForm } from '@/components/inventario/product-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NuevoProductoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/inventario" className="p-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo Producto</h1>
          <p className="text-sm text-muted-foreground">Registra un nuevo vehículo o ítem en tu inventario.</p>
        </div>
      </div>

      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  )
}
