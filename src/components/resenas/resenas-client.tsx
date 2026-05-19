'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUploader } from '@/components/ui/image-uploader'
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Resena {
  id: string
  nombre_cliente: string
  vehiculo_comprado?: string
  texto: string
  estrellas: number
  foto_url?: string
  visible: boolean
  created_at: string
  tenant_id: string
}

const EMPTY: Partial<Resena> = {
  nombre_cliente: '', vehiculo_comprado: '', texto: '',
  estrellas: 5, foto_url: '', visible: true,
}

export function ResenasClient({ resenas: initial, tenantId }: { resenas: Resena[], tenantId: string }) {
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState<Partial<Resena>>(EMPTY)
  const [fotoUrl, setFotoUrl] = useState<string>('')
  const [saving, setSaving]   = useState(false)
  const supabase = createClient()
  const router   = useRouter()

  function openNew() { setEditing(EMPTY); setFotoUrl(''); setOpen(true) }
  function openEdit(r: Resena) { setEditing(r); setFotoUrl(r.foto_url || ''); setOpen(true) }

  function handleUploaded(urls: string[]) {
    setFotoUrl(urls[0])
    toast.success('✓ Foto subida')
  }

  async function save() {
    if (!editing.nombre_cliente || !editing.texto) {
      toast.error('Nombre y texto son requeridos'); return
    }
    setSaving(true)
    const payload = {
      tenant_id:        tenantId,
      nombre_cliente:   editing.nombre_cliente,
      vehiculo_comprado: editing.vehiculo_comprado || null,
      texto:            editing.texto,
      estrellas:        editing.estrellas ?? 5,
      foto_url:         fotoUrl || null,
      visible:          editing.visible ?? true,
    }
    const { error } = editing.id
      ? await supabase.from('resenas').update(payload).eq('id', editing.id)
      : await supabase.from('resenas').insert(payload)
    if (error) { toast.error('Error: ' + error.message); setSaving(false); return }
    toast.success(editing.id ? 'Reseña actualizada' : 'Reseña creada')
    setOpen(false); setSaving(false); router.refresh()
  }

  async function toggleVisible(r: Resena) {
    await supabase.from('resenas').update({ visible: !r.visible }).eq('id', r.id)
    toast.success(r.visible ? 'Reseña ocultada' : 'Reseña publicada')
    router.refresh()
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar esta reseña?')) return
    await supabase.from('resenas').delete().eq('id', id)
    toast.success('Reseña eliminada'); router.refresh()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Reseñas</h1>
          <p className="text-sm text-muted-foreground mt-0.5 hidden sm:block">Gestiona las reseñas visibles en el catálogo público.</p>
        </div>
        <Button onClick={openNew} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Nueva reseña
        </Button>
      </div>

      {/* ── DESKTOP TABLE ── */}
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
            {initial.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-sm text-muted-foreground">Sin reseñas aún. Agrega la primera.</td></tr>
            ) : initial.map(r => (
              <tr key={r.id} className="group border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                <td className="pl-5 py-3">
                  <div className="flex items-center gap-2.5">
                    {r.foto_url
                      ? <img src={r.foto_url} alt="" className="w-8 h-8 rounded-full object-cover border border-border/50 shrink-0" />
                      : <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{r.nombre_cliente.charAt(0)}</div>}
                    <span className="font-medium text-sm">{r.nombre_cliente}</span>
                  </div>
                </td>
                <td className="px-3 text-sm text-primary">{r.vehiculo_comprado || '—'}</td>
                <td className="px-3 text-yellow-400 text-sm">{'★'.repeat(r.estrellas)}{'☆'.repeat(5 - r.estrellas)}</td>
                <td className="px-3 max-w-[220px]">
                  <p className="text-sm text-muted-foreground truncate italic">"{r.texto}"</p>
                </td>
                <td className="px-3">
                  <Badge variant="outline" className={r.visible ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400' : 'bg-muted text-muted-foreground'}>
                    {r.visible ? 'Visible' : 'Oculta'}
                  </Badge>
                </td>
                <td className="pr-5">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleVisible(r)}>
                      {r.visible ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}>
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50" onClick={() => remove(r.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="md:hidden space-y-3">
        {initial.length === 0 ? (
          <div className="text-center py-14 bg-white dark:bg-background rounded-xl border border-border/60 text-sm text-muted-foreground">Sin reseñas aún.</div>
        ) : initial.map(r => (
          <div key={r.id} className="bg-white dark:bg-background border border-border/60 rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {r.foto_url
                  ? <img src={r.foto_url} alt="" className="w-8 h-8 rounded-full object-cover border border-border/50 shrink-0" />
                  : <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">{r.nombre_cliente.charAt(0)}</div>}
                <div>
                  <p className="font-semibold text-sm">{r.nombre_cliente}</p>
                  {r.vehiculo_comprado && <p className="text-xs text-primary">{r.vehiculo_comprado}</p>}
                </div>
              </div>
              <Badge variant="outline" className={`text-[10px] shrink-0 ${r.visible ? 'bg-green-50 text-green-700 border-green-200' : 'bg-muted text-muted-foreground'}`}>
                {r.visible ? 'Visible' : 'Oculta'}
              </Badge>
            </div>
            <p className="text-yellow-400 text-sm">{'★'.repeat(r.estrellas)}{'☆'.repeat(5 - r.estrellas)}</p>
            <p className="text-xs text-muted-foreground italic line-clamp-2">"{r.texto}"</p>
            <div className="flex gap-1.5 pt-1 border-t border-border/40">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => toggleVisible(r)}>
                {r.visible ? <><EyeOff className="w-3 h-3" /> Ocultar</> : <><Eye className="w-3 h-3" /> Publicar</>}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => openEdit(r)}>
                <Pencil className="w-3 h-3" /> Editar
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 hover:text-red-600 hover:bg-red-50" onClick={() => remove(r.id)}>
                <Trash2 className="w-3 h-3" /> Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ── MODAL ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] bg-[#fafafa] dark:bg-background border-border/40 max-h-[92dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing.id ? 'Editar reseña' : 'Nueva reseña'}</DialogTitle>
          </DialogHeader>
          <div tabIndex={0} className="sr-only" aria-hidden />

          <div className="space-y-4 mt-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nombre del cliente *</Label>
                <Input placeholder="Carlos Méndez" value={editing.nombre_cliente || ''}
                  onChange={e => setEditing(p => ({...p, nombre_cliente: e.target.value}))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Vehículo comprado</Label>
                <Input placeholder="Toyota Hilux 2024" value={editing.vehiculo_comprado || ''}
                  onChange={e => setEditing(p => ({...p, vehiculo_comprado: e.target.value}))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Calificación</Label>
              <Select value={String(editing.estrellas || 5)} onValueChange={v => setEditing(p => ({...p, estrellas: parseInt(v)}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[5,4,3,2,1].map(n => (
                    <SelectItem key={n} value={String(n)}>
                      {'★'.repeat(n)}{'☆'.repeat(5-n)} ({n} {n === 1 ? 'estrella' : 'estrellas'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Texto de la reseña *</Label>
              <Textarea
                placeholder="El asesor fue excelente, me ayudó a encontrar el carro perfecto..."
                className="resize-none min-h-[80px]"
                value={editing.texto || ''}
                onChange={e => setEditing(p => ({...p, texto: e.target.value}))}
              />
            </div>

            {/* Foto del cliente */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Foto del cliente (opcional)</Label>
              {fotoUrl ? (
                <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border/60 rounded-xl">
                  <img src={fotoUrl} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-primary/30" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Foto cargada</p>
                    <p className="text-xs text-muted-foreground truncate">{fotoUrl}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setFotoUrl('')}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <ImageUploader
                  folder="resenas"
                  maxFiles={1}
                  onUploaded={handleUploaded}
                  hint="Foto de perfil del cliente · 1 imagen · JPG o PNG"
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="res-vis" checked={editing.visible ?? true}
                onChange={e => setEditing(p => ({...p, visible: e.target.checked}))}
                className="w-4 h-4 accent-primary" />
              <Label htmlFor="res-vis" className="text-sm cursor-pointer">Visible en el catálogo público</Label>
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-border/40">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save} disabled={saving}>
                {saving ? 'Guardando...' : (editing.id ? 'Actualizar' : 'Crear reseña')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
