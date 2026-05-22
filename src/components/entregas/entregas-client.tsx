'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ImageUpload } from '@/components/inventario/image-upload'
import { Plus, Pencil, Trash2, Eye, EyeOff, ArrowLeft, ArrowRight, Star } from 'lucide-react'
import { toggleVisibleEntrega, deleteEntrega, upsertEntrega } from '@/actions/content'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface EntregaFoto { url: string; es_portada: boolean; orden: number }
interface Entrega {
  id: string; cliente_nombre: string; vehiculo: string
  fecha_entrega?: string; foto_principal?: string
  fotos_extra?: string; nota?: string; visible: boolean; tenant_id: string
}
const EMPTY: Partial<Entrega> = { cliente_nombre:'',vehiculo:'',fecha_entrega:'',foto_principal:'',fotos_extra:'[]',nota:'',visible:true }

export function EntregasClient({ entregas: initial, tenantId }: { entregas: Entrega[]; tenantId: string }) {
  const [entregas, setEntregas] = useState(initial)
  const [open, setOpen]         = useState(false)
  const [editing, setEditing]   = useState<Partial<Entrega>>(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [newFiles, setNewFiles]         = useState<File[]>([])
  const [existingFotos, setExistingFotos] = useState<EntregaFoto[]>([])
  const supabase = createClient()

  function openNew() { setEditing(EMPTY); setNewFiles([]); setExistingFotos([]); setOpen(true) }
  function openEdit(e: Entrega) {
    setEditing(e); setNewFiles([])
    const extras: string[] = e.fotos_extra ? JSON.parse(e.fotos_extra) : []
    const todas = [e.foto_principal,...extras].filter(Boolean) as string[]
    setExistingFotos(todas.map((url,i)=>({url,es_portada:i===0,orden:i})))
    setOpen(true)
  }

  function movePhoto(index: number, dir: 'left'|'right') {
    const arr = [...existingFotos]; const swap = dir==='left'?index-1:index+1
    if (swap<0||swap>=arr.length) return
    ;[arr[index],arr[swap]]=[arr[swap],arr[index]]
    setExistingFotos(arr.map((f,i)=>({...f,es_portada:i===0,orden:i})))
  }
  function removeExisting(index: number) { setExistingFotos(prev=>prev.filter((_,i)=>i!==index)) }

  async function handleToggle(e: Entrega) {
    setEntregas(prev=>prev.map(x=>x.id===e.id?{...x,visible:!e.visible}:x))
    const res = await toggleVisibleEntrega(e.id, !e.visible)
    if (!res.success) { setEntregas(prev=>prev.map(x=>x.id===e.id?{...x,visible:e.visible}:x)); toast.error('Error: '+res.error) }
    else toast.success(e.visible?'Ocultada del catálogo':'Publicada en el catálogo')
  }

  async function handleDelete(e: Entrega) {
    if (!confirm('¿Eliminar esta entrega?')) return
    setEntregas(prev=>prev.filter(x=>x.id!==e.id))
    const res = await deleteEntrega(e.id)
    if (!res.success) { setEntregas(prev=>[...prev,e]); toast.error('Error: '+res.error) }
    else toast.success('Entrega eliminada')
  }

  async function save() {
    if (!editing.cliente_nombre||!editing.vehiculo) { toast.error('Cliente y vehículo requeridos'); return }
    setSaving(true)
    try {
      const uploadedUrls: string[] = []
      for (const file of newFiles) {
        const ext=file.name.split('.').pop()
        const path=`entregas/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
        const {error} = await supabase.storage.from('drive-sync-media').upload(path, file)
        if (error) throw error
        const {data} = supabase.storage.from('drive-sync-media').getPublicUrl(path)
        uploadedUrls.push(data.publicUrl)
      }
      const todas = [...existingFotos.map(f=>f.url), ...uploadedUrls]
      const payload = {
        id: editing.id, cliente_nombre: editing.cliente_nombre, vehiculo: editing.vehiculo,
        fecha_entrega: editing.fecha_entrega||null, foto_principal: todas[0]||null,
        fotos_extra: JSON.stringify(todas.slice(1)), nota: editing.nota||null, visible: editing.visible??true,
      }
      const res = await upsertEntrega(payload, tenantId)
      if (!res.success) throw new Error(res.error)
      toast.success(editing.id?'Entrega actualizada':'Entrega guardada')
      setOpen(false)
    } catch (err: any) { toast.error('Error: '+err.message) }
    finally { setSaving(false) }
  }

  function formatFecha(d?: string) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'})
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Entregas</h1>
          <p className="text-sm text-muted-foreground mt-0.5 hidden sm:block">Gestiona las fotos de entregas visibles en el catálogo.</p>
        </div>
        <Button onClick={openNew} className="gap-2 shrink-0"><Plus className="w-4 h-4"/>Nueva entrega</Button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block border border-border/60 rounded-xl bg-white dark:bg-background shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr className="h-11 border-b border-border/60">
              <th className="text-left text-xs font-medium text-muted-foreground pl-5">Foto</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3">Vehículo</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3">Cliente</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3">Fecha</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3">Visible</th>
              <th className="text-right text-xs font-medium text-muted-foreground pr-5">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entregas.length===0
              ? <tr><td colSpan={6} className="text-center py-12 text-sm text-muted-foreground">Sin entregas aún.</td></tr>
              : entregas.map(e=>(
                <tr key={e.id} className="group border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="pl-5 py-3">
                    {e.foto_principal
                      ? <div className="w-12 h-9 relative shrink-0"><Image src={e.foto_principal} alt="" fill sizes="48px" className="object-cover rounded-lg border border-border/50"/></div>
                      : <div className="w-12 h-9 rounded-lg bg-muted flex items-center justify-center text-[10px] text-muted-foreground/50">Sin foto</div>}
                  </td>
                  <td className="px-3 font-medium text-sm">{e.vehiculo}</td>
                  <td className="px-3 text-sm text-muted-foreground">{e.cliente_nombre}</td>
                  <td className="px-3 text-sm text-muted-foreground">{formatFecha(e.fecha_entrega)}</td>
                  <td className="px-3">
                    <Badge variant="outline" className={e.visible?'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400':'bg-muted text-muted-foreground'}>
                      {e.visible?'Visible':'Oculta'}
                    </Badge>
                  </td>
                  <td className="pr-5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={()=>handleToggle(e)}>
                        {e.visible?<EyeOff className="w-3.5 h-3.5 text-muted-foreground"/>:<Eye className="w-3.5 h-3.5 text-muted-foreground"/>}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={()=>openEdit(e)}><Pencil className="w-3.5 h-3.5 text-muted-foreground"/></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50" onClick={()=>handleDelete(e)}><Trash2 className="w-3.5 h-3.5"/></Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {entregas.length===0
          ? <div className="text-center py-14 bg-white dark:bg-background rounded-xl border border-border/60 text-sm text-muted-foreground">Sin entregas aún.</div>
          : entregas.map(e=>(
            <div key={e.id} className="bg-white dark:bg-background border border-border/60 rounded-xl p-4 shadow-sm flex gap-3">
              {e.foto_principal
                ? <div className="w-16 h-14 relative shrink-0"><Image src={e.foto_principal} alt="" fill sizes="64px" className="object-cover rounded-lg border border-border/50"/></div>
                : <div className="w-16 h-14 rounded-lg bg-muted shrink-0"/>}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm truncate">{e.vehiculo}</p>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${e.visible?'bg-green-50 text-green-700 border-green-200':'bg-muted text-muted-foreground'}`}>
                    {e.visible?'Visible':'Oculta'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{e.cliente_nombre} · {formatFecha(e.fecha_entrega)}</p>
                <div className="flex gap-1.5 mt-2">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={()=>handleToggle(e)}>
                    {e.visible?<><EyeOff className="w-3 h-3"/>Ocultar</>:<><Eye className="w-3 h-3"/>Publicar</>}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={()=>openEdit(e)}><Pencil className="w-3 h-3"/>Editar</Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 hover:text-red-600 hover:bg-red-50" onClick={()=>handleDelete(e)}><Trash2 className="w-3 h-3"/>Eliminar</Button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={v=>{if(!saving)setOpen(v)}}>
        <DialogContent className="w-[95vw] max-w-[620px] bg-white dark:bg-background border-border/40 max-h-[92dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing.id?'Editar entrega':'Nueva entrega'}</DialogTitle></DialogHeader>
          <div tabIndex={0} className="sr-only" aria-hidden/>
          <div className="space-y-5 mt-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Cliente *</Label>
                <Input placeholder="Ana Martínez" value={editing.cliente_nombre||''} onChange={e=>setEditing(p=>({...p,cliente_nombre:e.target.value}))}/></div>
              <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Vehículo *</Label>
                <Input placeholder="Toyota Hilux SRV 2022" value={editing.vehiculo||''} onChange={e=>setEditing(p=>({...p,vehiculo:e.target.value}))}/></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Fecha de entrega</Label>
              <Input type="date" value={editing.fecha_entrega?.substring(0,10)||''} onChange={e=>setEditing(p=>({...p,fecha_entrega:e.target.value}))}/></div>

            {existingFotos.length>0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Fotos actuales — Usa las flechas para reordenar. <Star className="w-3 h-3 inline text-yellow-500"/> = Portada</Label>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {existingFotos.map((foto,idx)=>(
                    <div key={idx} className="relative shrink-0 w-28">
                      <div className="relative group w-28 h-28">
                        <Image src={foto.url} alt="" fill sizes="112px" className={`object-cover rounded-lg border-2 ${foto.es_portada?'border-primary ring-2 ring-primary/30':'border-border'}`}/>
                        <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{idx+1}</div>
                        {foto.es_portada&&<div className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5"><Star className="w-2.5 h-2.5"/>Portada</div>}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <button type="button" disabled={idx===0} onClick={()=>movePhoto(idx,'left')} className="p-1 rounded border border-border hover:bg-muted disabled:opacity-30"><ArrowLeft className="w-3.5 h-3.5"/></button>
                        <button type="button" onClick={()=>removeExisting(idx)} className="p-1 rounded border border-border hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-500"/></button>
                        <button type="button" disabled={idx===existingFotos.length-1} onClick={()=>movePhoto(idx,'right')} className="p-1 rounded border border-border hover:bg-muted disabled:opacity-30"><ArrowRight className="w-3.5 h-3.5"/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{existingFotos.length>0?'Agregar más fotos':'Fotos de la entrega'}</Label>
              <p className="text-[11px] text-muted-foreground -mt-1">Las fotos se suben al guardar. La primera será la portada.</p>
              <ImageUpload images={newFiles} setImages={setNewFiles}/>
            </div>

            <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Nota (opcional)</Label>
              <Textarea placeholder="¡Felicitaciones Ana por tu nuevo vehículo! 🎉" className="resize-none" rows={3} value={editing.nota||''} onChange={e=>setEditing(p=>({...p,nota:e.target.value}))}/></div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="ent-vis" checked={editing.visible??true} onChange={e=>setEditing(p=>({...p,visible:e.target.checked}))} className="w-4 h-4 accent-primary"/>
              <Label htmlFor="ent-vis" className="text-sm cursor-pointer">Visible en el catálogo público</Label>
            </div>
            <div className="flex justify-end gap-2 pt-1 border-t border-border/40">
              <Button variant="outline" onClick={()=>setOpen(false)} disabled={saving}>Cancelar</Button>
              <Button onClick={save} disabled={saving}>{saving?(newFiles.length>0?`Subiendo ${newFiles.length} foto${newFiles.length>1?'s':''}...`:'Guardando...'):(editing.id?'Actualizar':'Guardar entrega')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
