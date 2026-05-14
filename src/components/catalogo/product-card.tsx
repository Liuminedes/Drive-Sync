'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { VehicleDetailModal } from './vehicle-detail-modal'
import { useState } from 'react'

export function ProductCard({ product }: { product: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { marca, modelo, anio, kilometraje } = product.detalles || {}
  const imageUrl = product.producto_fotos?.[0]?.url || 'https://via.placeholder.com/600x400?text=Sin+Foto'

  return (
    <Card className="group overflow-hidden border border-border bg-background shadow-sm hover:shadow-md transition-all duration-300 rounded-xl flex flex-col">
      <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={product.titulo}
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {product.destacado && (
          <Badge className="absolute top-3 right-3 shadow-md bg-primary text-primary-foreground border-none font-medium px-2.5 py-0.5 rounded-md" variant="default">
            Destacado
          </Badge>
        )}
        
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Badge variant="secondary" className="bg-white/90 text-black border-none hover:bg-white backdrop-blur-sm cursor-pointer" onClick={() => setIsModalOpen(true)}>
            Ver detalles completos
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-5 flex-grow flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold tracking-tight leading-tight line-clamp-2">{product.titulo}</h2>
        </div>
        
        <div className="text-sm text-muted-foreground flex flex-wrap gap-x-2 gap-y-1 items-center">
          {anio && <span className="bg-muted px-2 py-0.5 rounded-md">{anio}</span>}
          {kilometraje && <span className="flex items-center gap-1">• {kilometraje.toLocaleString()} km</span>}
          {marca && <span>• {marca}</span>}
        </div>

        <div className="mt-auto pt-4 border-t border-border/50">
          <span className="text-2xl font-bold tracking-tighter">
            ${Number(product.precio_venta).toLocaleString()} <span className="text-sm text-muted-foreground font-normal tracking-normal">{product.moneda}</span>
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button 
          variant="default" 
          className="w-full h-10 font-medium rounded-lg shadow-sm transition-all"
          onClick={() => setIsModalOpen(true)}
        >
          Contactar Asesor
        </Button>
      </CardFooter>

      <VehicleDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={product} 
      />
    </Card>
  )
}
