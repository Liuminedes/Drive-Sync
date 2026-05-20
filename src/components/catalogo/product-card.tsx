'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VehicleDetailModal } from './vehicle-detail-modal'
import { useState } from 'react'

interface Props {
  product: any
  precioFormateado?: string  // si viene del wrapper con moneda convertida
}

export function ProductCard({ product, precioFormateado }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { marca, anio, kilometraje } = product.detalles || {}
  const imageUrl = product.producto_fotos?.find((f: any) => f.es_portada)?.url
    || product.producto_fotos?.[0]?.url
    || 'https://via.placeholder.com/600x400?text=Sin+Foto'

  const precio = precioFormateado
    || `$${Number(product.precio_venta).toLocaleString('es-CO')} ${product.moneda || 'COP'}`

  function handleShare(e: React.MouseEvent) {
    e.stopPropagation()
    const url = `${window.location.origin}/catalogo?v=${product.id}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        const btn = e.currentTarget as HTMLElement
        btn.setAttribute('data-copied','1')
        setTimeout(() => btn.removeAttribute('data-copied'), 2000)
      })
    }
  }

  return (
    <>
      <Card className="group overflow-hidden border border-border bg-background shadow-sm hover:shadow-md transition-all duration-300 rounded-xl flex flex-col">
        <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={product.titulo}
            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>

          {product.destacado && (
            <Badge className="absolute top-3 right-3 shadow-md bg-primary text-primary-foreground border-none font-medium px-2.5 py-0.5 rounded-md">
              Destacado
            </Badge>
          )}

          {/* Botón compartir */}
          <ShareButton onClick={handleShare}/>

          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Badge variant="secondary" className="bg-white/90 text-black border-none hover:bg-white backdrop-blur-sm cursor-pointer text-xs"
              onClick={() => setIsModalOpen(true)}>
              Ver detalles
            </Badge>
          </div>
        </div>

        <CardContent className="p-5 flex-grow flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight leading-tight line-clamp-2">{product.titulo}</h2>
          <div className="text-sm text-muted-foreground flex flex-wrap gap-x-2 gap-y-1 items-center">
            {anio && <span className="bg-muted px-2 py-0.5 rounded-md">{anio}</span>}
            {kilometraje && <span>• {Number(kilometraje).toLocaleString()} km</span>}
            {marca && <span>• {marca}</span>}
          </div>
          <div className="mt-auto pt-4 border-t border-border/50">
            <span className="text-2xl font-bold tracking-tighter">{precio}</span>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0">
          <Button variant="default" className="w-full h-10 font-medium rounded-lg shadow-sm"
            onClick={() => setIsModalOpen(true)}>
            Contactar Asesor
          </Button>
        </CardFooter>
      </Card>

      <VehicleDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={product}/>
    </>
  )
}

function ShareButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  const [copied, setCopied] = useState(false)
  function handle(e: React.MouseEvent) { onClick(e); setCopied(true); setTimeout(()=>setCopied(false),2000) }
  return (
    <button onClick={handle} title="Copiar link"
      className="absolute top-3 left-3 h-8 px-2.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/20 text-white flex items-center gap-1.5 text-xs font-medium opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-black/70">
      {copied ? (
        <><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg><span className="text-green-400">Copiado</span></>
      ) : (
        <><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Compartir</>
      )}
    </button>
  )
}
