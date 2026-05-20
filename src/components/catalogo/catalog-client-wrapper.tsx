'use client'

import { useState, useMemo } from 'react'
import { CatalogFilters } from './catalog-filters'
import { ProductCard } from './product-card'

interface Props {
  productos: any[]
}

const USD_TO_COP = 4150

export function CatalogClientWrapper({ productos }: Props) {
  const [moneda, setMoneda] = useState<'COP' | 'USD'>('COP')

  // Extraer opciones únicas para los filtros
  const marcas = useMemo(() =>
    [...new Set(productos.map(p => p.detalles?.marca).filter(Boolean))].sort()
  , [productos])

  const anos = useMemo(() =>
    [...new Set(productos.map(p => p.detalles?.anio?.toString()).filter(Boolean))].sort().reverse()
  , [productos])

  const categorias = useMemo(() =>
    [...new Set(productos.map(p => p.categoria).filter(Boolean))].sort()
  , [productos])

  // Leer filtros del URL (client-side para no rerenderizar el servidor)
  const [filtros, setFiltros] = useState({ marca: '', categoria: '', ano: '', transmision: '', orden: '' })

  function updateFiltro(key: string, value: string) {
    setFiltros(prev => ({ ...prev, [key]: value }))
  }

  // Aplicar filtros
  const productosFiltrados = useMemo(() => {
    let list = [...productos]

    if (filtros.marca)       list = list.filter(p => p.detalles?.marca === filtros.marca)
    if (filtros.categoria)   list = list.filter(p => p.categoria === filtros.categoria)
    if (filtros.ano)         list = list.filter(p => p.detalles?.anio?.toString() === filtros.ano)
    if (filtros.transmision) list = list.filter(p => p.detalles?.transmision?.toLowerCase().includes(filtros.transmision.toLowerCase()))

    if (filtros.orden === 'precio_asc')  list = list.sort((a, b) => Number(a.precio_venta) - Number(b.precio_venta))
    if (filtros.orden === 'precio_desc') list = list.sort((a, b) => Number(b.precio_venta) - Number(a.precio_venta))

    return list
  }, [productos, filtros])

  // Formatea y convierte precio según moneda del producto y moneda elegida por el usuario
  function formatPrecio(precio: number, monedaProducto: string): string {
    const cop = monedaProducto === 'USD' ? precio * USD_TO_COP : precio
    const usd = monedaProducto === 'COP' ? precio / USD_TO_COP : precio

    if (moneda === 'COP') {
      return `$${Math.round(cop).toLocaleString('es-CO')} COP`
    } else {
      return `$${Math.round(usd).toLocaleString('en-US')} USD`
    }
  }

  const activeCount = Object.values(filtros).filter(Boolean).length

  return (
    <div>
      {/* Barra de filtros client-side */}
      <div className="mb-6">
        <CatalogFilters
          marcas={marcas}
          anos={anos}
          categorias={categorias}
          moneda={moneda}
          onMonedaChange={setMoneda}
          filtros={filtros}
          onFiltroChange={updateFiltro}
          onReset={() => setFiltros({ marca:'', categoria:'', ano:'', transmision:'', orden:'' })}
          activeCount={activeCount}
        />
      </div>

      {/* Contador de resultados */}
      {activeCount > 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          {productosFiltrados.length} vehículo{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Grid */}
      {productosFiltrados.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-muted/10 rounded-2xl border border-dashed border-border">
          <p className="text-muted-foreground">No hay vehículos que coincidan con los filtros.</p>
          <button
            onClick={() => setFiltros({ marca:'', categoria:'', ano:'', transmision:'', orden:'' })}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {productosFiltrados.map(producto => (
            <ProductCard
              key={producto.id}
              product={producto}
              precioFormateado={formatPrecio(Number(producto.precio_venta), producto.moneda || 'COP')}
            />
          ))}
        </div>
      )}
    </div>
  )
}
