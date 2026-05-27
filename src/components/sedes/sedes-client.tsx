'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Edit2, Trash2, Plus, MapPin } from 'lucide-react'
import { updateSede, createSede, deleteSede } from '@/actions/sedes'
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
  
  const router = useRouter()

  useEffect(() => { setSedes(initialSedes) }, [initialSedes])

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
        const res = await updateSede(editingSede.id, formData)
        if (!res.success) throw new Error(res.error)
        toast.success('Sede actualizada')
      } else {
        const res = await createSede(formData, tenantId)
        if (!res.success) throw new Error(res.error)
        toast.success('Sede creada')
      }
      setIsModalOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error('Error al guardar la sede: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta sede?')) return
    try {
      const res = await deleteSede(id)
      if (!res.success) throw new Error(res.error)
      toast.success('Sede eliminada')
      router.refresh()
    } catch (err: any) {
      toast.error('Error al eliminar la sede: ' + err.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenModal()} className="h-9 gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Nueva Sede
        </Button>
      </div>

      {/* ── DESKTOP TABLE (md+) ── */}
      <div className="hidden md:block border border-border/60 rounded-xl bg-white dark:bg-background shadow-sm overflow-hidden">
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
              <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No hay sedes registradas.</TableCell></TableRow>
            ) : (
              sedes.map((sede) => (
                <TableRow key={sede.id} className="h-[52px] group hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium tracking-tight pl-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
                      {sede.nombre}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{sede.ciudad}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{sede.direccion}</TableCell>
                  <TableCell className="text-right space-x-1 pr-6">
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleOpenModal(sede)}><Edit2 className="w-4 h-4 text-muted-foreground" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all" onClick={() => handleDelete(sede.id)}><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── MOBILE CARDS (< md) ── */}
      <div className="md:hidden space-y-3">
        {sedes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-background rounded-xl border border-border/60 text-sm text-muted-foreground">No hay sedes registradas.</div>
        ) : (
          sedes.map((sede) => (
            <div key={sede.id} className="bg-white dark:bg-background border border-border/60 rounded-xl p-4 shadow-sm flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{sede.nombre}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sede.ciudad}</p>
                <p className="text-xs text-muted-foreground truncate">{sede.direccion}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(sede)}><Edit2 className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(sede.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] bg-[#fafafa] dark:bg-background border-border/40">
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
            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar Sede'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
