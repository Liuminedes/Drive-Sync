'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Edit2, Trash2, Plus, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Sede {
  id: string
  nombre: string
  ciudad: string
  direccion: string
}

export function SedesClient({ initialSedes, tenantId }: { initialSedes: Sede[], tenantId: string }) {
  const [sedes, setSedes] = useState<Sede[]>(initialSedes)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSede, setEditingSede] = useState<Sede | null>(null)
  const [formData, setFormData] = useState({ nombre: '', ciudad: '', direccion: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setSedes(initialSedes)
  }, [initialSedes])

  const handleOpenModal = (sede?: Sede) => {
    if (sede) {
      setEditingSede(sede)
      setFormData({ nombre: sede.nombre, ciudad: sede.ciudad, direccion: sede.direccion })
    } else {
      setEditingSede(null)
      setFormData({ nombre: '', ciudad: '', direccion: '' })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingSede) {
        const { error } = await supabase.from('sedes').update(formData).eq('id', editingSede.id)
        if (error) throw error
        toast.success('Sede actualizada')
      } else {
        const { error } = await supabase.from('sedes').insert({ ...formData, tenant_id: tenantId })
        if (error) throw error
        toast.success('Sede creada')
      }
      setIsModalOpen(false)
      router.refresh()
    } catch (err) {
      toast.error('Error al guardar la sede')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta sede?')) return
    try {
      const { error } = await supabase.from('sedes').delete().eq('id', id)
      if (error) throw error
      toast.success('Sede eliminada')
      router.refresh()
    } catch (err) {
      toast.error('Error al eliminar la sede')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenModal()} className="h-9 gap-2">
          <Plus className="w-4 h-4" />
          Nueva Sede
        </Button>
      </div>

      <div className="border border-border/60 rounded-xl bg-white dark:bg-background shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="h-11 hover:bg-transparent">
              <TableHead className="font-medium pl-6">Nombre</TableHead>
              <TableHead className="font-medium">Ciudad</TableHead>
              <TableHead className="font-medium">Dirección</TableHead>
              <TableHead className="text-right font-medium pr-6">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sedes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No hay sedes registradas.
                </TableCell>
              </TableRow>
            ) : (
              sedes.map((sede) => (
                <TableRow key={sede.id} className="h-[52px] group hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium tracking-tight pl-6 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary/70" />
                    {sede.nombre}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{sede.ciudad}</TableCell>
                  <TableCell className="text-muted-foreground">{sede.direccion}</TableCell>
                  <TableCell className="text-right space-x-1 pr-6">
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleOpenModal(sede)}>
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all" onClick={() => handleDelete(sede.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#fafafa] dark:bg-background border-border/40">
          <DialogHeader>
            <DialogTitle>{editingSede ? 'Editar Sede' : 'Crear Nueva Sede'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la Sede</Label>
              <Input id="nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required placeholder="Ej. Sede Norte" className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input id="ciudad" value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} required placeholder="Ej. Bogotá" className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} required placeholder="Ej. Calle 100 #15-20" className="h-10" />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar Sede'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
