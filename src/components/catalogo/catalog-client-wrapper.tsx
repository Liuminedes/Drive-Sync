'use client'

import { useState, useMemo, useEffect } from 'react'
import { CatalogFilters } from './catalog-filters'
import { ProductCard } from './product-card'
import { LayoutGrid, List, ArrowDownUp } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface Props {
  productos: any[]
}

const USD_TO_COP = 4150
const ITEMS_PER_PAGE = 12

export function CatalogClientWrapper({ productos }: Props) {
  const [moneda, setMoneda] = useState<'COP' | 'USD'>('COP')
  const [layoutView, setLayoutView] = useState<'grid' | 'list'>('grid')

  const formatText = (text: string | undefined | null) => {
    if (!text) return ''
    const trimmed = text.trim()
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
  }

  // Extraer opciones únicas para los filtros (normalizando texto)
  const marcas = useMemo(() =>
    [...new Set(productos.map(p => formatText(p.detalles?.marca)).filter(Boolean))].sort()
  , [productos])

  const anos = useMemo(() =>
    [...new Set(productos.map(p => p.detalles?.anio?.toString()?.trim()).filter(Boolean))].sort().reverse()
  , [productos])

  const categorias = useMemo(() =>
    [...new Set(productos.map(p => formatText(p.categoria)).filter(Boolean))].sort()
  , [productos])

  // Leer filtros del URL (client-side para no rerenderizar el servidor)
  const [filtros, setFiltros] = useState({ marca: '', categoria: '', ano: '', transmision: '', orden: '' })
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  function updateFiltro(key: string, value: string) {
    setFiltros(prev => ({ ...prev, [key]: value }))
    setVisibleCount(ITEMS_PER_PAGE)
  }

  // Aplicar filtros
  const productosFiltrados = useMemo(() => {
    let list = [...productos]

    if (filtros.marca)       list = list.filter(p => formatText(p.detalles?.marca) === filtros.marca)
    if (filtros.categoria)   list = list.filter(p => formatText(p.categoria) === filtros.categoria)
    if (filtros.ano)         list = list.filter(p => p.detalles?.anio?.toString()?.trim() === filtros.ano)
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
      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-grow">
          <CatalogFilters
            marcas={marcas}
            anos={anos}
            categorias={categorias}
            moneda={moneda}
            onMonedaChange={setMoneda}
            filtros={filtros}
            onFiltroChange={updateFiltro}
            onReset={() => {
              setFiltros({ marca:'', categoria:'', ano:'', transmision:'', orden:'' })
              setVisibleCount(ITEMS_PER_PAGE)
            }}
            activeCount={activeCount}
          />
        </div>
        
        {/* Controles de vista y orden */}
        <div className="flex flex-wrap items-center gap-2 md:mt-0">
          <Select value={filtros.orden || '_none'} onValueChange={v => updateFiltro('orden', v === '_none' ? '' : (v || ''))}>
            <SelectTrigger className="h-9 w-[180px] bg-white dark:bg-background border-border/60">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ArrowDownUp className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  {filtros.orden === 'precio_asc' ? 'Menor precio' : filtros.orden === 'precio_desc' ? 'Mayor precio' : 'Ordenar'}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">Sin orden</SelectItem>
              <SelectItem value="precio_asc">Precio: Menor a mayor</SelectItem>
              <SelectItem value="precio_desc">Precio: Mayor a menor</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center bg-muted/50 border border-border/60 rounded-lg p-1 shrink-0">
            <button onClick={() => setLayoutView('grid')} className={`p-1.5 rounded-md transition-all ${layoutView === 'grid' ? 'bg-white dark:bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setLayoutView('list')} className={`p-1.5 rounded-md transition-all ${layoutView === 'list' ? 'bg-white dark:bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      {activeCount > 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          {productosFiltrados.length} vehículo{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Grid / List */}
      {productosFiltrados.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-muted/10 rounded-2xl border border-dashed border-border">
          <p className="text-muted-foreground">No hay vehículos que coincidan con los filtros.</p>
          <button
            onClick={() => {
              setFiltros({ marca:'', categoria:'', ano:'', transmision:'', orden:'' })
              setVisibleCount(ITEMS_PER_PAGE)
            }}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <div className={layoutView === 'grid' 
            ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5"
            : "flex flex-col gap-4"
          }>
            {productosFiltrados.slice(0, visibleCount).map(producto => (
              <ProductCard
                key={producto.id}
                product={producto}
                precioFormateado={formatPrecio(Number(producto.precio_venta), producto.moneda || 'COP')}
                layout={layoutView}
              />
            ))}
          </div>

          {visibleCount < productosFiltrados.length && (
            <div className="mt-8 flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                className="w-full sm:w-auto px-8 py-2 font-semibold shadow-sm"
              >
                Cargar más vehículos ({productosFiltrados.length - visibleCount} restantes)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
