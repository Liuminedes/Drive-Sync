'use client'

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { Check, Settings, Fuel, Activity, Navigation } from 'lucide-react'

const leadSchema = z.object({
  nombre_cliente: z.string().min(2, 'El nombre es muy corto'),
  email_cliente: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono_cliente: z.string().min(7, 'Teléfono inválido'),
  mensaje: z.string().optional()
})

type LeadFormValues = z.infer<typeof leadSchema>

export function VehicleDetailModal({ isOpen, onClose, product }: { isOpen: boolean, onClose: () => void, product: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [showMobileForm, setShowMobileForm] = useState(false)
  const supabase = createClient()
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema) as any
  })

  if (!product) return null

  const detalles = product.detalles || {}
  const fotos = product.producto_fotos || []
  const mainImage = fotos[activeImage]?.url || 'https://via.placeholder.com/800x600?text=Sin+Foto'

  const onSubmit = async (data: LeadFormValues) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('leads').insert({
        tenant_id: product.tenant_id,
        producto_id: product.id,
        nombre_cliente: data.nombre_cliente,
        email_cliente: data.email_cliente || null,
        telefono_cliente: data.telefono_cliente,
        mensaje: data.mensaje || null,
        origen: 'CATALOGO_PUBLICO'
      })
      if (error) throw error
      toast.success('¡Solicitud enviada! Un asesor te contactará pronto.')
      reset()
      onClose()
    } catch (err: any) {
      toast.error('Hubo un error al enviar tu solicitud.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setShowMobileForm(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        /*
          Desktop: dos columnas, altura automática — idéntico al original.
          Mobile:  una columna, 92dvh con scroll, sin autofocus (tabIndex en el popup
                   lo evita; además los inputs usan tabIndex={-1} en mobile si fuera necesario).
          El truco para no mostrar el teclado en mobile es NO poner autoFocus en ningún input
          y asegurarnos de que el DialogContent no haga focus automático.
          Base UI hace focus al primer elemento focusable; lo bloqueamos poniendo un
          div invisible con tabIndex={0} y autoFocus al inicio del contenido.
        */
        className="!w-[95vw] !max-w-[1000px] p-0 overflow-hidden bg-[#fafafa] dark:bg-background border-border/40 !h-[92dvh] md:!h-auto max-h-[95vh] rounded-xl flex flex-col"
      >
        <DialogTitle className="sr-only">{product.titulo}</DialogTitle>
        <DialogDescription className="sr-only">Detalles del vehículo {product.titulo}</DialogDescription>

        {/*
          Trampa de foco: div invisible que absorbe el autoFocus de Base UI
          sin abrir el teclado (no es un input). Solo activo en mobile (md:hidden).
        */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
        <div tabIndex={0} className="sr-only md:hidden" aria-hidden="true" />

        <div className="flex flex-col md:flex-row h-full overflow-hidden flex-1 min-h-0 relative">

          {/* ── Left: Gallery + Specs ── */}
          <div className={`w-full md:w-1/2 bg-muted/20 flex flex-col p-4 md:p-6 border-b md:border-b-0 md:border-r border-border/40 overflow-y-auto pb-24 md:pb-6 ${showMobileForm ? 'hidden md:flex' : 'flex'}`}>
            
            {/* Title & Price (Mobile Only - Moved to top) */}
            <div className="md:hidden mb-4 shrink-0">
              <h2 className="text-xl font-bold tracking-tight mb-1 leading-tight">{product.titulo}</h2>
              <div className="text-2xl font-extrabold tracking-tighter text-primary">
                ${Number(product.precio_venta).toLocaleString()} <span className="text-sm font-medium text-muted-foreground tracking-normal">{product.moneda}</span>
              </div>
            </div>

            {/* Main image */}
            <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden mb-4 border border-border/50 shadow-sm bg-muted shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mainImage} alt={product.titulo} className="object-cover w-full h-full" />
              {product.destacado && (
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-medium px-2.5 py-0.5 rounded-md border-none shadow-md">
                  Destacado
                </Badge>
              )}
            </div>

            {/* Thumbnails */}
            {fotos.length > 1 && (
              <div className="grid grid-cols-4 gap-2 shrink-0 mb-4">
                {fotos.map((foto: any, index: number) => (
                  <button
                    key={foto.id || index}
                    onClick={() => setActiveImage(index)}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${activeImage === index ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={foto.url} alt="thumbnail" className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}

            {/* Specs */}
            <div className="mt-2 md:mt-8 space-y-4 shrink-0 pb-4">
              <h3 className="font-semibold tracking-tight text-lg">Especificaciones Técnicas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm text-muted-foreground">
                {detalles.marca && <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Marca: <span className="font-medium text-foreground truncate">{detalles.marca}</span></div>}
                {detalles.modelo && <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Modelo: <span className="font-medium text-foreground truncate">{detalles.modelo}</span></div>}
                {detalles.anio && <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Año: <span className="font-medium text-foreground">{detalles.anio}</span></div>}
                {detalles.kilometraje && <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-primary shrink-0" /> Km: <span className="font-medium text-foreground">{detalles.kilometraje.toLocaleString()}</span></div>}
                {detalles.transmision && <div className="flex items-center gap-2"><Settings className="w-4 h-4 text-primary shrink-0" /> Trans: <span className="font-medium text-foreground truncate">{detalles.transmision}</span></div>}
                {detalles.combustible && <div className="flex items-center gap-2"><Fuel className="w-4 h-4 text-primary shrink-0" /> Combustible: <span className="font-medium text-foreground truncate">{detalles.combustible}</span></div>}
                {detalles.traccion && <div className="flex items-center gap-2"><Navigation className="w-4 h-4 text-primary shrink-0" /> Tracción: <span className="font-medium text-foreground truncate">{detalles.traccion}</span></div>}
                {detalles.motor && <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Motor: <span className="font-medium text-foreground truncate">{detalles.motor}</span></div>}
                {detalles.carroceria && <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Carrocería: <span className="font-medium text-foreground truncate">{detalles.carroceria}</span></div>}
                {detalles.color_exterior && <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Ext: <span className="font-medium text-foreground truncate">{detalles.color_exterior}</span></div>}
                {detalles.color_interior && <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Int: <span className="font-medium text-foreground truncate">{detalles.color_interior}</span></div>}
                {detalles.puertas > 0 && <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Puertas: <span className="font-medium text-foreground">{detalles.puertas}</span></div>}
                {detalles.pasajeros > 0 && <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Pasajeros: <span className="font-medium text-foreground">{detalles.pasajeros}</span></div>}
              </div>
            </div>
          </div>

          {/* ── Right: Info & Form ── */}
          <div className={`w-full md:w-1/2 p-4 md:p-8 flex-col overflow-y-auto bg-white dark:bg-background absolute inset-0 z-10 md:static md:z-auto md:flex ${showMobileForm ? 'flex' : 'hidden'}`}>
            
            {/* Boton volver en mobile */}
            <Button variant="ghost" className="md:hidden self-start mb-2 -ml-2 text-muted-foreground" onClick={() => setShowMobileForm(false)}>
              ← Volver a detalles
            </Button>

            <div className="hidden md:block mb-6 shrink-0 pt-2 md:pt-0">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 leading-tight">{product.titulo}</h2>
              <div className="text-3xl md:text-4xl font-extrabold tracking-tighter text-primary">
                ${Number(product.precio_venta).toLocaleString()} <span className="text-base md:text-lg font-medium text-muted-foreground tracking-normal">{product.moneda}</span>
              </div>
            </div>

            <div className="bg-muted/30 border border-border/50 rounded-xl p-4 md:p-5 mb-8 shrink-0">
              <h3 className="font-medium tracking-tight mb-4">¿Te interesa este vehículo?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Déjanos tus datos y un asesor especializado se pondrá en contacto contigo para agendar una cita o darte más detalles.
              </p>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre_cliente" className="text-xs text-muted-foreground">Nombre completo</Label>
                  {/*
                    readOnly + onFocus remove-readonly trick para evitar que el navegador
                    haga autofocus y abra el teclado en móvil al abrir el modal.
                    El usuario igual puede escribir normalmente al tocarlo.
                  */}
                  <Input
                    id="nombre_cliente"
                    className="h-10"
                    placeholder="Ej. Juan Pérez"
                    autoComplete="name"
                    {...register('nombre_cliente')}
                  />
                  {errors.nombre_cliente && <p className="text-xs text-red-500">{errors.nombre_cliente.message}</p>}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono_cliente" className="text-xs text-muted-foreground">Teléfono</Label>
                    <Input id="telefono_cliente" className="h-10" placeholder="Ej. 3001234567" autoComplete="tel" {...register('telefono_cliente')} />
                    {errors.telefono_cliente && <p className="text-xs text-red-500">{errors.telefono_cliente.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email_cliente" className="text-xs text-muted-foreground">Correo electrónico</Label>
                    <Input id="email_cliente" type="email" className="h-10" placeholder="juan@ejemplo.com" autoComplete="email" {...register('email_cliente')} />
                    {errors.email_cliente && <p className="text-xs text-red-500">{errors.email_cliente.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensaje" className="text-xs text-muted-foreground">Mensaje adicional (Opcional)</Label>
                  <Textarea id="mensaje" {...register('mensaje')} placeholder="¿Tienes alguna pregunta específica? ¿Deseas agendar un test drive?" className="resize-none" />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-base font-medium shadow-md">
                    {isSubmitting ? 'Enviando...' : 'Contactar a un Asesor'}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Sticky CTA for Mobile */}
          {!showMobileForm && (
            <div className="md:hidden absolute bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-background/90 backdrop-blur-md border-t border-border/50 z-20">
              <Button className="w-full h-12 text-base font-semibold shadow-lg" onClick={() => setShowMobileForm(true)}>
                Contactar Asesor
              </Button>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  )
}
