'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from 'lucide-react'
import { ImageUpload } from '@/components/inventario/image-upload'
import { createAdminClient } from '@/lib/supabase/admin'
import { toggleVisibleResena, deleteResena, upsertResena } from '@/actions/content'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Resena {
  id: string; nombre_cliente: string; vehiculo_comprado?: string
  texto: string; estrellas: number; foto_url?: string
  visible: boolean; created_at: string; tenant_id: string
}
const EMPTY: Partial<Resena> = { nombre_cliente:'',vehiculo_comprado:'',texto:'',estrellas:5,foto_url:'',visible:true }

export function ResenasClient({ resenas: initial, tenantId }: { resenas: Resena[]; tenantId: string }) {
  const [resenas, setResenas]   = useState(initial)
  const [open, setOpen]         = useState(false)
  const [editing, setEditing]   = useState<Partial<Resena>>(EMPTY)
  const [fotoFiles, setFotoFiles] = useState<File[]>([])
  const [fotoUrl, setFotoUrl]   = useState('')
  const [saving, setSaving]     = useState(false)
  const [, startTransition]     = useTransition()
  const supabase = createClient()

  function openNew() { setEditing(EMPTY); setFotoFiles([]); setFotoUrl(''); setOpen(true) }
  function openEdit(r: Resena) { setEditing(r); setFotoFiles([]); setFotoUrl(r.foto_url||''); setOpen(true) }

  // Toggle visible — optimistic + server action
  async function handleToggle(r: Resena) {
    // Actualización optimista inmediata
    setResenas(prev => prev.map(x => x.id === r.id ? {...x, visible: !r.visible} : x))
    const res = await toggleVisibleResena(r.id, !r.visible)
    if (!res.success) {
      // Revertir si falló
      setResenas(prev => prev.map(x => x.id === r.id ? {...x, visible: r.visible} : x))
      toast.error('Error: ' + res.error)
    } else {
      toast.success(r.visible ? 'Reseña ocultada' : 'Reseña publicada')
    }
  }

  async function handleDelete(r: Resena) {
    if (!confirm('¿Eliminar esta reseña?')) return
    setResenas(prev => prev.filter(x => x.id !== r.id))
    const res = await deleteResena(r.id)
    if (!res.success) {
      setResenas(prev => [...prev, r])
      toast.error('Error: ' + res.error)
    } else toast.success('Reseña eliminada')
  }

  async function save() {
    if (!editing.nombre_cliente || !editing.texto) { toast.error('Nombre y texto requeridos'); return }
    setSaving(true)
    try {
      let finalFotoUrl = fotoUrl

      // Subir foto si hay archivo nuevo
      if (fotoFiles[0]) {
        const ext   = fotoFiles[0].name.split('.').pop()
        const path  = `resenas/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
        const bytes = await fotoFiles[0].arrayBuffer()
        const { error } = await supabase.storage.from('drive-sync-media').upload(path, bytes, { contentType: fotoFiles[0].type })
        if (error) throw error
        const { data } = supabase.storage.from('drive-sync-media').getPublicUrl(path)
        finalFotoUrl = data.publicUrl
      }

      const payload = {
        id: editing.id, nombre_cliente: editing.nombre_cliente,
        vehiculo_comprado: editing.vehiculo_comprado||null,
        texto: editing.texto, estrellas: editing.estrellas??5,
        foto_url: finalFotoUrl||null, visible: editing.visible??true,
      }
      const res = await upsertResena(payload, tenantId)
      if (!res.success) throw new Error(res.error)
      toast.success(editing.id ? 'Reseña actualizada' : 'Reseña creada')
      setOpen(false)
    } catch (err: any) { toast.error('Error: ' + err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Reseñas</h1>
          <p className="text-sm text-muted-foreground mt-0.5 hidden sm:block">Gestiona las reseñas visibles en el catálogo público.</p>
        </div>
        <Button onClick={openNew} className="gap-2 shrink-0"><Plus className="w-4 h-4"/>Nueva reseña</Button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block border border-border/60 rounded-xl bg-white dark:bg-background shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr className="h-11 border-b border-border/60">
              <th className="text-left text-xs font-medium text-muted-foreground pl-5">Cliente</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3">Vehículo</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3">Estrellas</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3">Texto</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3">Visible</th>
              <th className="text-right text-xs font-medium text-muted-foreground pr-5">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resenas.length === 0
              ? <tr><td colSpan={6} className="text-center py-12 text-sm text-muted-foreground">Sin reseñas aún.</td></tr>
              : resenas.map(r => (
                <tr key={r.id} className="group border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="pl-5 py-3">
                    <div className="flex items-center gap-2.5">
                      {r.foto_url
                        ? <img src={r.foto_url} alt="" className="w-8 h-8 rounded-full object-cover border border-border/50 shrink-0"/>
                        : <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{r.nombre_cliente.charAt(0)}</div>}
                      <span className="font-medium text-sm">{r.nombre_cliente}</span>
                    </div>
                  </td>
                  <td className="px-3 text-sm text-primary">{r.vehiculo_comprado||'—'}</td>
                  <td className="px-3 text-yellow-400 text-sm">{'★'.repeat(r.estrellas)}{'☆'.repeat(5-r.estrellas)}</td>
                  <td className="px-3 max-w-[220px]"><p className="text-sm text-muted-foreground truncate italic">"{r.texto}"</p></td>
                  <td className="px-3">
                    <Badge variant="outline" className={r.visible?'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400':'bg-muted text-muted-foreground'}>
                      {r.visible?'Visible':'Oculta'}
                    </Badge>
                  </td>
                  <td className="pr-5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={()=>handleToggle(r)} title={r.visible?'Ocultar':'Publicar'}>
                        {r.visible?<EyeOff className="w-3.5 h-3.5 text-muted-foreground"/>:<Eye className="w-3.5 h-3.5 text-muted-foreground"/>}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={()=>openEdit(r)}><Pencil className="w-3.5 h-3.5 text-muted-foreground"/></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50" onClick={()=>handleDelete(r)}><Trash2 className="w-3.5 h-3.5"/></Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {resenas.length===0
          ? <div className="text-center py-14 bg-white dark:bg-background rounded-xl border border-border/60 text-sm text-muted-foreground">Sin reseñas aún.</div>
          : resenas.map(r => (
            <div key={r.id} className="bg-white dark:bg-background border border-border/60 rounded-xl p-4 shadow-sm space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {r.foto_url
                    ? <img src={r.foto_url} alt="" className="w-8 h-8 rounded-full object-cover border border-border/50 shrink-0"/>
                    : <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">{r.nombre_cliente.charAt(0)}</div>}
                  <div>
                    <p className="font-semibold text-sm">{r.nombre_cliente}</p>
                    {r.vehiculo_comprado&&<p className="text-xs text-primary">{r.vehiculo_comprado}</p>}
                  </div>
                </div>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${r.visible?'bg-green-50 text-green-700 border-green-200':'bg-muted text-muted-foreground'}`}>
                  {r.visible?'Visible':'Oculta'}
                </Badge>
              </div>
              <p className="text-yellow-400 text-sm">{'★'.repeat(r.estrellas)}{'☆'.repeat(5-r.estrellas)}</p>
              <p className="text-xs text-muted-foreground italic line-clamp-2">"{r.texto}"</p>
              <div className="flex gap-1.5 pt-1 border-t border-border/40">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={()=>handleToggle(r)}>
                  {r.visible?<><EyeOff className="w-3 h-3"/>Ocultar</>:<><Eye className="w-3 h-3"/>Publicar</>}
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={()=>openEdit(r)}><Pencil className="w-3 h-3"/>Editar</Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 hover:text-red-600 hover:bg-red-50" onClick={()=>handleDelete(r)}><Trash2 className="w-3 h-3"/>Eliminar</Button>
              </div>
            </div>
          ))}
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] bg-[#fafafa] dark:bg-background border-border/40 max-h-[92dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing.id?'Editar reseña':'Nueva reseña'}</DialogTitle></DialogHeader>
          <div tabIndex={0} className="sr-only" aria-hidden/>
          <div className="space-y-4 mt-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nombre *</Label>
                <Input placeholder="Carlos Méndez" value={editing.nombre_cliente||''} onChange={e=>setEditing(p=>({...p,nombre_cliente:e.target.value}))}/>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Vehículo comprado</Label>
                <Input placeholder="Toyota Hilux 2024" value={editing.vehiculo_comprado||''} onChange={e=>setEditing(p=>({...p,vehiculo_comprado:e.target.value}))}/>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Calificación</Label>
              <Select value={String(editing.estrellas||5)} onValueChange={v=>setEditing(p=>({...p,estrellas:parseInt(v??'5')}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  {[5,4,3,2,1].map(n=><SelectItem key={n} value={String(n)}>{'★'.repeat(n)}{'☆'.repeat(5-n)} ({n} {n===1?'estrella':'estrellas'})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Texto *</Label>
              <Textarea placeholder="El asesor fue excelente..." className="resize-none min-h-[80px]" value={editing.texto||''} onChange={e=>setEditing(p=>({...p,texto:e.target.value}))}/>
            </div>

            {/* Foto */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Foto del cliente (opcional)</Label>
              {(fotoUrl||fotoFiles[0]) ? (
                <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border/60 rounded-xl">
                  <img src={fotoFiles[0]?URL.createObjectURL(fotoFiles[0]):fotoUrl} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"/>
                  <p className="flex-1 text-sm font-medium">{fotoFiles[0]?`📎 ${fotoFiles[0].name}`:'Foto actual'}</p>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={()=>{setFotoUrl('');setFotoFiles([])}}><X className="w-4 h-4"/></Button>
                </div>
              ) : (
                <ImageUpload images={fotoFiles} setImages={(files)=>{const arr=typeof files==='function'?files(fotoFiles):files;setFotoFiles(arr.slice(-1))}}/>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="res-vis" checked={editing.visible??true} onChange={e=>setEditing(p=>({...p,visible:e.target.checked}))} className="w-4 h-4 accent-primary"/>
              <Label htmlFor="res-vis" className="text-sm cursor-pointer">Visible en el catálogo público</Label>
            </div>
            <div className="flex justify-end gap-2 pt-1 border-t border-border/40">
              <Button variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button>
              <Button onClick={save} disabled={saving}>{saving?'Guardando...':(editing.id?'Actualizar':'Crear reseña')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
