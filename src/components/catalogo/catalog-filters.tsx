'use client'

import { useState } from 'react'
import { SlidersHorizontal, X, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Filtros { marca: string; categoria: string; ano: string; transmision: string; orden: string }

interface Props {
  marcas: string[]
  anos: string[]
  categorias: string[]
  moneda: 'COP' | 'USD'
  onMonedaChange: (m: 'COP' | 'USD') => void
  filtros: Filtros
  onFiltroChange: (key: string, value: string) => void
  onReset: () => void
  activeCount: number
}

export function CatalogFilters({ marcas, anos, categorias, moneda, onMonedaChange, filtros, onFiltroChange, onReset, activeCount }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-2 h-9" onClick={() => setOpen(o => !o)}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtros
            {activeCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                {activeCount}
              </span>
            )}
          </Button>
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" className="gap-1.5 h-9 text-muted-foreground" onClick={onReset}>
              <X className="w-3 h-3" /> Limpiar
            </Button>
          )}
          {filtros.marca       && <Chip label={`Marca: ${filtros.marca}`}            onRemove={() => onFiltroChange('marca', '')} />}
          {filtros.categoria   && <Chip label={`Tipo: ${filtros.categoria}`}         onRemove={() => onFiltroChange('categoria', '')} />}
          {filtros.ano         && <Chip label={`Año: ${filtros.ano}`}                onRemove={() => onFiltroChange('ano', '')} />}
          {filtros.transmision && <Chip label={`Trans: ${filtros.transmision}`}      onRemove={() => onFiltroChange('transmision', '')} />}
          {filtros.orden       && <Chip label={filtros.orden==='precio_asc'?'Precio ↑':'Precio ↓'} onRemove={() => onFiltroChange('orden', '')} />}
        </div>

        {/* Selector de moneda */}
        <div className="flex items-center gap-1 bg-muted/50 border border-border/60 rounded-lg p-1 shrink-0">
          {(['COP','USD'] as const).map(m => (
            <button key={m} onClick={() => onMonedaChange(m)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${moneda===m?'bg-white dark:bg-background shadow-sm text-foreground':'text-muted-foreground hover:text-foreground'}`}>
              <DollarSign className="w-3 h-3"/>{m}
            </button>
          ))}
        </div>
      </div>

      {open && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-4 bg-white dark:bg-background border border-border/60 rounded-xl shadow-sm">
          <Sel label="Marca"      value={filtros.marca}       onChange={v=>onFiltroChange('marca',v)}       options={marcas}     placeholder="Todas"/>
          <Sel label="Categoría"  value={filtros.categoria}   onChange={v=>onFiltroChange('categoria',v)}   options={categorias} placeholder="Todas"/>
          <Sel label="Año"        value={filtros.ano}         onChange={v=>onFiltroChange('ano',v)}         options={anos}       placeholder="Todos"/>
          <Sel label="Transmisión" value={filtros.transmision} onChange={v=>onFiltroChange('transmision',v)} options={['Automática','Manual','CVT','Doble embrague']} placeholder="Todas"/>
          <Sel label="Precio"     value={filtros.orden}       onChange={v=>onFiltroChange('orden',v)}
            options={['precio_asc','precio_desc']} labels={['Menor a mayor','Mayor a menor']} placeholder="Sin orden"/>
        </div>
      )}
    </div>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-xs font-medium px-2.5 py-1 rounded-full">
      {label}<button onClick={onRemove}><X className="w-3 h-3 ml-0.5"/></button>
    </span>
  )
}

function Sel({ label, value, onChange, options, labels, placeholder }: {
  label:string; value:string; onChange:(v:string)=>void; options:string[]; labels?:string[]; placeholder:string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <Select value={value||'_all'} onValueChange={v=>onChange((v??'_all')==='_all'?'':v??'')}>
        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={placeholder}/></SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">{placeholder}</SelectItem>
          {options.map((o,i)=><SelectItem key={o} value={o}>{labels?.[i]||o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}
