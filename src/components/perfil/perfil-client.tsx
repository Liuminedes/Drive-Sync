'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/inventario/image-upload'
import { createClient } from '@/lib/supabase/client'
import { Save, Phone, Mail, Link, Star, Car, Award, Building2, User } from 'lucide-react'
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
  logo_empresa_url?: string
  anios_exp?: string
  ventas_realizadas?: string
  calificacion?: string
}

const DEFAULT: Partial<Perfil> = {
  nombre: '', cargo: '', concesionario: '', frase: '',
  telefono: '', email: '', instagram: '', linkedin: '',
  foto_url: '', logo_empresa_url: '', anios_exp: '', ventas_realizadas: '', calificacion: '',
}

// ── Sube UN archivo al bucket y devuelve la URL pública ──────────
async function uploadSingle(
  supabase: ReturnType<typeof createClient>,
  file: File,
  folder: string
): Promise<string> {
  const ext      = file.name.split('.').pop()
  const safeName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
  const path     = `${folder}/${safeName}`

  const { error } = await supabase.storage
    .from('drive-sync-media')
    .upload(path, file)
  if (error) throw error

  const { data } = supabase.storage.from('drive-sync-media').getPublicUrl(path)
  return data.publicUrl
}

export function PerfilClient({ perfil: initial, tenantId }: { perfil: Perfil | null, tenantId: string }) {
  const [form, setForm]           = useState<Partial<Perfil>>(initial || DEFAULT)
  const [saving, setSaving]       = useState(false)

  // — Archivos pendientes de subir (misma dinámica que inventario) —
  const [fotoFiles, setFotoFiles]   = useState<File[]>([])   // foto del asesor
  const [logoFiles, setLogoFiles]   = useState<File[]>([])   // logo de la empresa

  const supabase = createClient()

  function f(k: keyof Perfil) { return (form[k] as string) || '' }
  function set(k: keyof Perfil) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({...p, [k]: e.target.value}))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre) { toast.error('El nombre es requerido'); return }
    setSaving(true)
    try {
      const updatedForm = { ...form }

      // 1. Subir foto del asesor si hay archivo nuevo
      if (fotoFiles.length > 0) {
        const url = await uploadSingle(supabase, fotoFiles[0], 'perfil/fotos')
        updatedForm.foto_url = url
        setForm(p => ({ ...p, foto_url: url }))
        setFotoFiles([])
      }

      // 2. Subir logo de empresa si hay archivo nuevo
      if (logoFiles.length > 0) {
        const url = await uploadSingle(supabase, logoFiles[0], 'perfil/logos')
        updatedForm.logo_empresa_url = url
        setForm(p => ({ ...p, logo_empresa_url: url }))
        setLogoFiles([])
      }

      // 3. Guardar en BD
      const { error } = await supabase
        .from('perfil_asesor')
        .upsert({ ...updatedForm, tenant_id: tenantId }, { onConflict: 'tenant_id' })

      if (error) throw error
      toast.success('✓ Perfil guardado. Los cambios ya se ven en el catálogo.')
    } catch (err: any) {
      toast.error('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Foto actual: si hay archivo pendiente usa preview, si no usa la URL guardada
  const fotoPreview = fotoFiles[0] ? URL.createObjectURL(fotoFiles[0]) : f('foto_url')
  const logoPreview = logoFiles[0] ? URL.createObjectURL(logoFiles[0]) : f('logo_empresa_url')

  return (
    <form onSubmit={save} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-sm text-muted-foreground mt-0.5 hidden sm:block">
            Personaliza la tarjeta de presentación visible en el catálogo público.
          </p>
        </div>
        <Button type="submit" disabled={saving} className="gap-2 shrink-0">
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Vista previa sticky ── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Vista previa en tiempo real
            </p>
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-white/10 shadow-xl">
              <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                backgroundSize: '28px 28px'
              }} />
              <div className="relative z-10 p-5">
                {/* Badge */}
                <div className="flex items-center gap-1.5 mb-4">
                  <span className="w-4 h-px bg-cyan-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                    Asesor Certificado · DriveSync
                  </span>
                </div>

                {/* Row: avatar | info | logo empresa */}
                <div className="flex items-center gap-3 mb-4">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-cyan-400/40 bg-gray-700 shadow-lg">
                      {fotoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={fotoPreview} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-cyan-400 font-bold text-xl">
                          {(f('nombre') || 'A').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm leading-tight truncate">{f('nombre') || 'Tu nombre'}</p>
                    <p className="text-cyan-400 text-[10px] font-semibold mt-0.5 truncate">{f('cargo') || 'Cargo'}</p>
                    <p className="text-gray-400 text-[10px] truncate">{f('concesionario') || 'Concesionario'}</p>
                  </div>

                  {/* Logo empresa */}
                  <div className="shrink-0 w-12 h-12 rounded-xl border border-white/15 bg-white/10 flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <Building2 className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Frase */}
                {f('frase') && (
                  <p className="text-gray-300 text-[11px] italic bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-4">
                    "{f('frase')}"
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-px bg-white/10 rounded-xl overflow-hidden mb-4">
                  {[
                    { val: f('anios_exp') || '—',        lbl: 'Experiencia' },
                    { val: f('ventas_realizadas') || '—', lbl: 'Ventas' },
                    { val: f('calificacion') || '—',      lbl: 'Calificación' },
                  ].map((s, i) => (
                    <div key={i} className="bg-gray-800/80 p-2.5 text-center">
                      <p className="text-cyan-400 font-bold text-sm leading-none">{s.val}</p>
                      <p className="text-gray-500 text-[9px] uppercase tracking-wider mt-1">{s.lbl}</p>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex gap-2">
                  <div className="flex-1 bg-white text-gray-900 text-[11px] font-semibold rounded-lg py-2 text-center">Llamar</div>
                  <div className="flex-1 bg-green-500 text-white text-[11px] font-semibold rounded-lg py-2 text-center">WhatsApp</div>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            </div>
          </div>
        </div>

        {/* ── Formulario ── */}
        <div className="lg:col-span-3 space-y-5">

          {/* ── Foto del asesor ── */}
          <div className="bg-white dark:bg-background border border-border/60 rounded-xl p-5 space-y-4">
            <p className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" /> Foto de perfil
            </p>

            {/* Preview actual */}
            {fotoPreview && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fotoPreview} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-primary/30 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {fotoFiles[0] ? `📎 ${fotoFiles[0].name} (pendiente de guardar)` : 'Foto actual'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{!fotoFiles[0] && f('foto_url')}</p>
                </div>
                {fotoFiles[0] && (
                  <Button type="button" variant="ghost" size="sm" className="text-xs shrink-0"
                    onClick={() => setFotoFiles([])}>
                    Quitar
                  </Button>
                )}
              </div>
            )}

            {/* Uploader — misma dinámica que inventario */}
            <div>
              <Label className="text-xs text-muted-foreground block mb-2">
                {fotoPreview ? 'Cambiar foto' : 'Subir foto'}
              </Label>
              <p className="text-[11px] text-muted-foreground mb-2">
                Selecciona 1 imagen · La foto se sube al presionar "Guardar cambios"
              </p>
              <ImageUpload
                images={fotoFiles}
                setImages={(files) => {
                  // Solo 1 foto — tomar la última seleccionada
                  const arr = typeof files === 'function' ? files(fotoFiles) : files
                  setFotoFiles(arr.slice(-1))
                }}
              />
            </div>
          </div>

          {/* ── Logo de la empresa ── */}
          <div className="bg-white dark:bg-background border border-border/60 rounded-xl p-5 space-y-4">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" /> Logo de la empresa / concesionario
            </p>

            {/* Preview actual */}
            {logoPreview && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
                <div className="w-14 h-14 rounded-xl border border-border bg-white flex items-center justify-center overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {logoFiles[0] ? `📎 ${logoFiles[0].name} (pendiente de guardar)` : 'Logo actual'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{!logoFiles[0] && f('logo_empresa_url')}</p>
                </div>
                {logoFiles[0] && (
                  <Button type="button" variant="ghost" size="sm" className="text-xs shrink-0"
                    onClick={() => setLogoFiles([])}>
                    Quitar
                  </Button>
                )}
              </div>
            )}

            <div>
              <Label className="text-xs text-muted-foreground block mb-2">
                {logoPreview ? 'Cambiar logo' : 'Subir logo'}
              </Label>
              <p className="text-[11px] text-muted-foreground mb-2">
                PNG con fondo transparente recomendado · Se sube al presionar "Guardar cambios"
              </p>
              <ImageUpload
                images={logoFiles}
                setImages={(files) => {
                  const arr = typeof files === 'function' ? files(logoFiles) : files
                  setLogoFiles(arr.slice(-1))
                }}
              />
            </div>
          </div>

          {/* ── Info personal ── */}
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
                <Input placeholder="Almotores · Cali" value={f('concesionario')} onChange={set('concesionario')} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs text-muted-foreground">Frase destacada</Label>
                <Input placeholder="Tu próximo vehículo está a un mensaje de distancia." value={f('frase')} onChange={set('frase')} />
              </div>
            </div>
          </div>

          {/* ── Estadísticas ── */}
          <div className="bg-white dark:bg-background border border-border/60 rounded-xl p-5 space-y-4">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-yellow-400" /> Estadísticas (tarjeta)
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Award className="w-3 h-3" /> Experiencia</Label>
                <Input placeholder="10 años" value={f('anios_exp')} onChange={set('anios_exp')} />
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

          {/* ── Contacto ── */}
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
