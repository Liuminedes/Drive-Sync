'use client'

import { useEffect, useState } from 'react'
import { VehicleDetailModal } from './vehicle-detail-modal'
import { useSearchParams } from 'next/navigation'

export function VehicleDeepLink({ productos }: { productos: any[] }) {
  const searchParams = useSearchParams()
  const [product, setProduct] = useState<any>(null)

  useEffect(() => {
    const vid = searchParams.get('v')
    if (vid && productos.length) {
      const found = productos.find(p => p.id === vid)
      if (found) setProduct(found)
    }
  }, [searchParams, productos])

  if (!product) return null

  return (
    <VehicleDetailModal
      isOpen={true}
      onClose={() => {
        setProduct(null)
        // Limpia el ?v= de la URL sin recargar
        const url = new URL(window.location.href)
        url.searchParams.delete('v')
        window.history.replaceState({}, '', url.toString())
      }}
      product={product}
    />
  )
}
