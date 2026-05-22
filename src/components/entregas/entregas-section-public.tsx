'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface Entrega {
  id: string
  cliente_nombre: string
  vehiculo: string
  fecha_entrega?: string
  foto_principal?: string
  fotos_extra?: string
  nota?: string
  visible?: boolean
}

export function EntregasSectionPublic({ entregas }: { entregas: Entrega[] }) {
  const [selected, setSelected] = useState<Entrega | null>(null)
  const [activeImg, setActiveImg] = useState(0)

  function open(e: Entrega) { setSelected(e); setActiveImg(0) }
  function close() { setSelected(null); setActiveImg(0) }

  function getFotos(e: Entrega): string[] {
    const extras: string[] = e.fotos_extra ? JSON.parse(e.fotos_extra) : []
    return [e.foto_principal, ...extras].filter(Boolean) as string[]
  }

  function formatFecha(d?: string) {
    if (!d) return ''
    return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-8 sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Momentos especiales</p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Entregas recientes</h2>
        <p className="text-muted-foreground mt-2">Cada entrega es un sueño cumplido. Aquí algunos de esos momentos.</p>
      </div>

      {/* ── Grid de tarjetas ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {entregas.map(e => (
          <div
            key={e.id}
            onClick={() => open(e)}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border cursor-pointer hover:shadow-md transition-all duration-200"
          >
            {e.foto_principal ? (
              <Image
                src={e.foto_principal}
                alt={`Entrega ${e.cliente_nombre}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
              <p className="text-white text-xs font-semibold leading-tight truncate">{e.vehiculo}</p>
              <p className="text-white/70 text-[10px] truncate">{e.cliente_nombre}</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Modal — mismo diseño que vehicle-detail-modal ── */}
      <Dialog open={!!selected} onOpenChange={close}>
        <DialogContent className="!w-[95vw] !max-w-[1000px] p-0 overflow-hidden bg-[#fafafa] dark:bg-background border-border/40 !h-[92dvh] md:!h-auto max-h-[95vh] rounded-xl flex flex-col">
          <DialogTitle className="sr-only">Entrega de vehículo</DialogTitle>
          <DialogDescription className="sr-only">Detalle de la entrega</DialogDescription>
          <div tabIndex={0} className="sr-only" aria-hidden />

          {selected && (() => {
            const fotos = getFotos(selected)
            return (
              <div className="flex flex-col md:flex-row h-full overflow-hidden flex-1 min-h-0">

                {/* ── Columna izquierda: galería (igual que vehicle-detail-modal) ── */}
                <div className="w-full md:w-1/2 bg-muted/20 flex flex-col p-4 md:p-6 border-b md:border-b-0 md:border-r border-border/40 overflow-y-auto">

                  {/* Imagen principal */}
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden mb-4 border border-border/50 shadow-sm bg-muted shrink-0">
                    {fotos[activeImg] ? (
                      <Image
                        src={fotos[activeImg]}
                        alt="Entrega"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21,15 16,10 5,21"/>
                        </svg>
                      </div>
                    )}
                    {/* Badge entrega exitosa sobre la foto */}
                    <Badge className="absolute top-3 left-3 bg-green-500 text-white border-none font-medium px-2.5 py-0.5 rounded-md shadow-md">
                      🎉 Entrega exitosa
                    </Badge>
                  </div>

                  {/* Thumbnails — igual que el modal de vehículos */}
                  {fotos.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 shrink-0">
                      {fotos.map((f, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImg(i)}
                          className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        >
                          <Image src={f} alt="" fill sizes="25vw" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Nota / dedicatoria debajo de la galería */}
                  {selected.nota && (
                    <div className="mt-4 bg-white dark:bg-muted/20 border border-border/50 rounded-xl p-4 shrink-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Nota</p>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">"{selected.nota}"</p>
                    </div>
                  )}
                </div>

                {/* ── Columna derecha: info — idéntica en estructura a vehicle-detail-modal ── */}
                <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col overflow-y-auto bg-white dark:bg-background">

                  {/* Eyebrow + título + cliente + fecha */}
                  <div className="mb-6 shrink-0 pt-2 md:pt-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
                      Entrega exitosa
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 leading-tight">
                      {selected.vehiculo}
                    </h2>

                    {/* Datos del cliente — en el mismo estilo que el precio del modal de vehículos */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-base text-foreground font-semibold">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-muted-foreground shrink-0">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        {selected.cliente_nombre}
                      </div>
                      {selected.fecha_entrega && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          {formatFecha(selected.fecha_entrega)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Separador visual */}
                  <div className="h-px bg-border/50 mb-6 shrink-0" />

                  {/* Mensaje motivacional — ocupa el espacio central */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="bg-muted/30 border border-border/50 rounded-xl p-5 text-center">
                      <div className="text-3xl mb-3">🚗✨</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Cada entrega es el inicio de una nueva aventura. Gracias por confiar en nosotros para hacer realidad este sueño.
                      </p>
                    </div>
                  </div>

                  {/* CTA al catálogo — mismo estilo que "Contactar a un Asesor" */}
                  <div className="mt-6 shrink-0">
                    <p className="text-xs text-muted-foreground mb-3">
                      ¿Te interesa un vehículo como este u otro de nuestro catálogo?
                    </p>
                    <a
                      href="#catalogo"
                      onClick={close}
                      className="w-full h-11 text-base font-medium shadow-md inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                      </svg>
                      Ver catálogo completo
                    </a>
                  </div>
                </div>

              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
