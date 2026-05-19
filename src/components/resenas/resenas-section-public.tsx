'use client'

import { Star } from 'lucide-react'

interface Resena {
  id: string
  nombre_cliente: string
  vehiculo_comprado?: string
  texto: string
  estrellas: number
  foto_url?: string
  created_at: string
}

export function ResenasSectionPublic({ resenas }: { resenas: Resena[] }) {
  return (
    <div>
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Clientes satisfechos</p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Lo que dicen de nosotros</h2>
        <p className="text-muted-foreground mt-2">Experiencias reales de quienes ya encontraron su vehículo ideal.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {resenas.map(r => (
          <div
            key={r.id}
            className="relative bg-background border border-border rounded-xl p-5 hover:border-border/80 hover:shadow-sm transition-all duration-200 flex flex-col gap-4"
          >
            {/* Quote decorativa */}
            <span className="absolute top-4 right-5 text-5xl leading-none text-primary/10 font-serif select-none">"</span>

            {/* Estrellas */}
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < (r.estrellas || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                />
              ))}
            </div>

            {/* Texto */}
            <p className="text-sm text-muted-foreground leading-relaxed italic flex-1">
              "{r.texto}"
            </p>

            {/* Cliente */}
            <div className="flex items-center gap-3 pt-2 border-t border-border/50">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 border border-border flex items-center justify-center shrink-0">
                {r.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.foto_url} alt={r.nombre_cliente} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary font-bold text-sm">
                    {(r.nombre_cliente || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{r.nombre_cliente}</p>
                {r.vehiculo_comprado && (
                  <p className="text-xs text-primary truncate">{r.vehiculo_comprado}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
