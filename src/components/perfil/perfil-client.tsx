'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { Save, Phone, Mail, Link, Star, Car, Award } from 'lucide-react'
import toast from 'react-hot-toast'

interface Perfil {
  tenant_id: string
  nombre: string
  cargo: string
  concesionario: string
  frase: string
  telefono: string
  email: string
  instagram?: string
  linkedin?: string
  foto_url?: string
  anios_exp?: string
  ventas_realizadas?: string
  calificacion?: string
}

const DEFAULT: Partial<Perfil> = {
  nombre: '', cargo: '', concesionario: '', frase: '',
  telefono: '', email: '', instagram: '', linkedin: '',
  foto_url: '', anios_exp: '', ventas_realizadas: '', calificacion: '',
}

export function PerfilClient({ perfil: initial, tenantId }: { perfil: Perfil | null, tenantId: string }) {
  const [form, setForm] = useState<Partial<Perfil>>(initial || DEFAULT)
  const [saving, setSaving] = useState(false)
  const [imgError, setImgError] = useState(false)
  const supabase = createClient()

  function f(k: keyof Perfil) { return (form[k] as string) || '' }
  function set(k: keyof Perfil) { return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setForm(p => ({...p, [k]: e.target.value})); setImgError(false) } }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre) { toast.error('El nombre es requerido'); return }
    setSaving(true)
    const payload = { ...form, tenant_id: tenantId }
    // upsert sobre la PK tenant_id — funciona tanto en creación como actualización
    const { error } = await supabase
      .from('perfil_asesor')
      .upsert(payload, { onConflict: 'tenant_id' })
    setSaving(false)
    if (error) { toast.error('Error: ' + error.message); return }
    toast.success('✓ Perfil guardado. Los cambios ya se ven en el catálogo.')
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-sm text-muted-foreground mt-0.5 hidden sm:block">Personaliza la tarjeta de presentación visible en el catálogo público.</p>
        </div>
        <Button type="submit" disabled={saving} className="gap-2 shrink-0">
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Vista previa (izquierda en desktop) ── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Vista previa en tiempo real</p>
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-white/10 shadow-xl">
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

              <div className="relative z-10 p-5">
                {/* Badge */}
                <div className="flex items-center gap-1.5 mb-4">
                  <span className="w-4 h-px bg-cyan-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Asesor Certificado · DriveSync</span>
                </div>

                {/* Avatar + info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400/40 bg-gray-700 shadow-lg">
                      {f('foto_url') && !imgError ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f('foto_url')} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-cyan-400 font-bold text-2xl">
                          {(f('nombre') || 'A').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-base leading-tight truncate">{f('nombre') || 'Tu nombre'}</p>
                    <p className="text-cyan-400 text-[11px] font-semibold mt-0.5 truncate">{f('cargo') || 'Cargo'}</p>
                    <p className="text-gray-400 text-[11px] truncate">{f('concesionario') || 'Concesionario'}</p>
                  </div>
                </div>

                {/* Frase */}
                {f('frase') && (
                  <p className="text-gray-300 text-[12px] italic bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-4">"{f('frase')}"</p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-px bg-white/10 rounded-xl overflow-hidden mb-4">
                  {[
                    { val: f('anios_exp') || '—', lbl: 'Experiencia' },
                    { val: f('ventas_realizadas') || '—', lbl: 'Ventas' },
                    { val: f('calificacion') || '—', lbl: 'Calificación' },
                  ].map((s, i) => (
                    <div key={i} className="bg-gray-800/80 p-3 text-center">
                      <p className="text-cyan-400 font-bold text-base leading-none">{s.val}</p>
                      <p className="text-gray-500 text-[9px] uppercase tracking-wider mt-1">{s.lbl}</p>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex gap-2">
                  <div className="flex-1 bg-green-500 text-white text-[11px] font-semibold rounded-lg py-2 text-center">WhatsApp</div>
                  <div className="flex-1 bg-gray-700 border border-white/10 text-gray-300 text-[11px] font-semibold rounded-lg py-2 text-center">Llamar</div>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            </div>
          </div>
        </div>

        {/* ── Formulario (derecha) ── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Foto */}
          <div className="bg-white dark:bg-background border border-border/60 rounded-xl p-5">
            <p className="text-sm font-semibold mb-3">Foto de perfil</p>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">URL de la foto</Label>
              <Input type="url" placeholder="https://tu-proyecto.supabase.co/storage/v1/object/public/fotos/foto.jpg" value={f('foto_url')} onChange={set('foto_url')} />
              <p className="text-[11px] text-muted-foreground">Sube la foto a Supabase Storage y pega la URL pública aquí. La vista previa se actualiza al instante.</p>
            </div>
          </div>

          {/* Info personal */}
          <div className="bg-white dark:bg-background border border-border/60 rounded-xl p-5 space-y-4">
            <p className="text-sm font-semibold">Información personal</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nombre completo *</Label>
                <Input placeholder="Iván Camilo Muñoz" value={f('nombre')} onChange={set('nombre')} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Cargo</Label>
                <Input placeholder="Asesor Certificado · DriveSync" value={f('cargo')} onChange={set('cargo')} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Concesionario / Empresa</Label>
                <Input placeholder="DriveSync · Cali" value={f('concesionario')} onChange={set('concesionario')} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs text-muted-foreground">Frase destacada</Label>
                <Input placeholder="Tu próximo vehículo está a un mensaje de distancia." value={f('frase')} onChange={set('frase')} />
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-white dark:bg-background border border-border/60 rounded-xl p-5 space-y-4">
            <p className="text-sm font-semibold flex items-center gap-2"><Star className="w-3.5 h-3.5 text-yellow-400" /> Estadísticas (tarjeta)</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Award className="w-3 h-3" /> Experiencia</Label>
                <Input placeholder="3 años" value={f('anios_exp')} onChange={set('anios_exp')} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Car className="w-3 h-3" /> Ventas</Label>
                <Input placeholder="+200" value={f('ventas_realizadas')} onChange={set('ventas_realizadas')} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Star className="w-3 h-3" /> Calificación</Label>
                <Input placeholder="4.9★" value={f('calificacion')} onChange={set('calificacion')} />
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="bg-white dark:bg-background border border-border/60 rounded-xl p-5 space-y-4">
            <p className="text-sm font-semibold">Contacto</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Teléfono / WhatsApp</Label>
                <Input placeholder="+57 300 123 4567" value={f('telefono')} onChange={set('telefono')} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Email</Label>
                <Input type="email" placeholder="ivan@drivesync.com" value={f('email')} onChange={set('email')} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Link className="w-3 h-3" /> Instagram</Label>
                <Input placeholder="@ivan.drivesync" value={f('instagram')} onChange={set('instagram')} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Link className="w-3 h-3" /> LinkedIn (URL)</Label>
                <Input type="url" placeholder="https://linkedin.com/in/..." value={f('linkedin')} onChange={set('linkedin')} />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} size="lg" className="gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar todos los cambios'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
