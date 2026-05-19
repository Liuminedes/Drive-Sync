'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Edit2, Trash2 } from 'lucide-react'
import { VehicleDetailModal } from '../catalogo/vehicle-detail-modal'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface ProductTableProps {
  productos: any[]
}

export function ProductTable({ productos }: ProductTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este vehículo? Esta acción no se puede deshacer.')) return
    setIsDeleting(id)
    try {
      const { error } = await supabase.from('productos').delete().eq('id', id)
      if (error) throw error
      toast.success('Vehículo eliminado correctamente')
      router.refresh()
    } catch (err) {
      toast.error('Error al eliminar el vehículo')
      console.error(err)
    } finally {
      setIsDeleting(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'DISPONIBLE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'EN_NEGOCIACION': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'RESERVADO': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'VENDIDO': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      case 'INACTIVO': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  return (
    <>
      {/* ─── DESKTOP TABLE (md+) — idéntico al original ─── */}
      <div className="hidden md:block border border-border/60 rounded-xl bg-white dark:bg-background shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr className="h-11 border-b border-border/60">
              <th className="w-[60px] pl-4 text-left text-xs font-medium text-muted-foreground">Foto</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3">Producto</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3">Categoría</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3">Precio</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3">Estado</th>
              <th className="text-right text-xs font-medium text-muted-foreground pr-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center h-24 text-sm text-muted-foreground">
                  No hay productos registrados.
                </td>
              </tr>
            ) : (
              productos.map((prod) => {
                const url = prod.producto_fotos?.[0]?.url || 'https://via.placeholder.com/40'
                return (
                  <tr key={prod.id} className="h-[52px] group hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0">
                    <td className="pl-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={prod.titulo} className="w-10 h-10 object-cover rounded aspect-square border border-border/50" />
                    </td>
                    <td className="px-3 font-medium tracking-tight text-sm">
                      {prod.titulo}
                      <div className="text-xs text-muted-foreground font-normal mt-0.5">
                        {prod.detalles?.marca} {prod.detalles?.modelo} {prod.detalles?.anio && `• ${prod.detalles.anio}`}
                      </div>
                    </td>
                    <td className="px-3 text-sm text-muted-foreground">
                      {prod.categoria.replace('_', ' ')}
                    </td>
                    <td className="px-3 font-semibold tracking-tight text-sm">
                      ${Number(prod.precio_venta).toLocaleString()}
                    </td>
                    <td className="px-3">
                      <Badge variant="outline" className={getStatusColor(prod.estado)}>
                        {prod.estado}
                      </Badge>
                    </td>
                    <td className="text-right space-x-1 pr-4 whitespace-nowrap">
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setSelectedProduct(prod)}>
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => router.push(`/dashboard/inventario/${prod.id}/editar`)}>
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button disabled={isDeleting === prod.id} variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all" onClick={() => handleDelete(prod.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── MOBILE CARDS (< md) ─── */}
      <div className="md:hidden space-y-3">
        {productos.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-background rounded-xl border border-border/60 text-sm text-muted-foreground">
            No hay productos registrados.
          </div>
        ) : (
          productos.map((prod) => {
            const url = prod.producto_fotos?.[0]?.url || 'https://via.placeholder.com/40'
            return (
              <div key={prod.id} className="bg-white dark:bg-background border border-border/60 rounded-xl p-4 shadow-sm flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={prod.titulo} className="w-16 h-16 object-cover rounded-lg border border-border/50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm tracking-tight leading-tight truncate">{prod.titulo}</h3>
                    <Badge variant="outline" className={`${getStatusColor(prod.estado)} text-[10px] shrink-0`}>
                      {prod.estado}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {prod.detalles?.marca} {prod.detalles?.modelo} {prod.detalles?.anio && `• ${prod.detalles.anio}`}
                  </p>
                  <p className="text-base font-bold tracking-tighter mt-1">
                    ${Number(prod.precio_venta).toLocaleString()}
                  </p>
                  <div className="flex gap-1.5 mt-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => setSelectedProduct(prod)}>
                      <Eye className="w-3 h-3" /> Ver
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => router.push(`/dashboard/inventario/${prod.id}/editar`)}>
                      <Edit2 className="w-3 h-3" /> Editar
                    </Button>
                    <Button disabled={isDeleting === prod.id} variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(prod.id)}>
                      <Trash2 className="w-3 h-3" /> Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <VehicleDetailModal 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        product={selectedProduct} 
      />
    </>
  )
}
