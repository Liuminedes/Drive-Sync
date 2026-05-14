'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
      <div className="border border-border/60 rounded-xl bg-white dark:bg-background shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="h-11 hover:bg-transparent">
              <TableHead className="w-[60px] pl-4">Foto</TableHead>
              <TableHead className="font-medium">Producto</TableHead>
              <TableHead className="font-medium">Categoría</TableHead>
              <TableHead className="font-medium">Precio</TableHead>
              <TableHead className="font-medium">Estado</TableHead>
              <TableHead className="text-right font-medium pr-4">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No hay productos registrados.
                </TableCell>
              </TableRow>
            ) : (
              productos.map((prod) => {
                const url = prod.producto_fotos?.[0]?.url || 'https://via.placeholder.com/40'
                return (
                  <TableRow key={prod.id} className="h-[52px] group hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={prod.titulo} className="w-10 h-10 object-cover rounded aspect-square border border-border/50" />
                    </TableCell>
                    <TableCell className="font-medium tracking-tight">
                      {prod.titulo}
                      <div className="text-xs text-muted-foreground font-normal mt-0.5">
                        {prod.detalles?.marca} {prod.detalles?.modelo} {prod.detalles?.anio && `• ${prod.detalles.anio}`}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {prod.categoria.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="font-semibold tracking-tight">
                      ${Number(prod.precio_venta).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(prod.estado)}>
                        {prod.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1 pr-4 whitespace-nowrap">
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setSelectedProduct(prod)}>
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => router.push(`/dashboard/inventario/${prod.id}/editar`)}>
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button disabled={isDeleting === prod.id} variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all" onClick={() => handleDelete(prod.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      <VehicleDetailModal 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        product={selectedProduct} 
      />
    </>
  )
}
