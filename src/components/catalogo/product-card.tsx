'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VehicleDetailModal } from './vehicle-detail-modal'
import { useState, useEffect } from 'react'

interface Props {
  product: any
  precioFormateado?: string  // si viene del wrapper con moneda convertida
  layout?: 'grid' | 'list'
}

export function ProductCard({ product, precioFormateado, layout = 'grid' }: Props) {
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
      navigator.clipboard.writeText(url).catch(err => console.error('Error al copiar:', err))
    }
  }

  return (
    <>
      <Card className={`group overflow-hidden border border-border bg-background shadow-sm hover:shadow-md transition-all duration-300 rounded-xl flex ${layout === 'list' ? 'flex-row items-stretch' : 'flex-col h-full'}`}>
        <div 
          className={`relative bg-muted overflow-hidden cursor-pointer shrink-0 ${layout === 'list' ? 'w-[40%] sm:w-1/3' : 'aspect-[4/3] w-full'}`}
          onClick={() => setIsModalOpen(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={product.titulo}
            className={`object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500 ${layout === 'list' ? 'absolute inset-0' : ''}`}/>
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

        <div className={`flex flex-col flex-grow ${layout === 'list' ? 'p-3 sm:p-5' : 'p-3 sm:p-4'}`}>
          <div className="flex-grow flex flex-col gap-1.5 sm:gap-2">
            <h2 className={`font-semibold tracking-tight leading-tight line-clamp-2 cursor-pointer hover:text-primary transition-colors ${layout === 'list' ? 'text-[15px] sm:text-lg' : 'text-[14px] sm:text-lg'}`} onClick={() => setIsModalOpen(true)}>{product.titulo}</h2>
            <div className={`text-muted-foreground flex flex-wrap gap-x-1.5 sm:gap-x-2 gap-y-1 items-center ${layout === 'list' ? 'text-[11px] sm:text-sm' : 'text-[11px] sm:text-sm'}`}>
              {anio && <span className="bg-muted px-1.5 sm:px-2 py-0.5 rounded-md text-foreground font-medium">{anio}</span>}
              {kilometraje && <span>• {Number(kilometraje).toLocaleString()} km</span>}
              {marca && <span>• {marca}</span>}
            </div>
            <div className={`mt-auto pt-2 sm:pt-3 flex items-end ${layout === 'list' ? '' : 'justify-between'}`}>
              <span className={`font-bold tracking-tighter ${layout === 'list' ? 'text-[16px] sm:text-2xl' : 'text-[15px] sm:text-xl'}`}>{precio}</span>
            </div>
          </div>

          <div className={`pt-2 sm:pt-4 mt-2 sm:mt-auto border-t border-border/50`}>
            <Button variant="default" className={`w-full font-medium rounded-lg shadow-sm ${layout === 'list' ? 'h-8 sm:h-10 text-xs sm:text-sm' : 'h-8 sm:h-10 text-xs sm:text-sm'}`}
              onClick={() => setIsModalOpen(true)}>
              Ver Detalles
            </Button>
          </div>
        </div>
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
