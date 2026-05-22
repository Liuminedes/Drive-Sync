'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'

export function InventoryFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const defaultSearch = searchParams.get('q') || ''
  const defaultEstado = searchParams.get('estado') || 'TODOS'

  const [search, setSearch] = useState(defaultSearch)
  const [estado, setEstado] = useState(defaultEstado)

  // Debounce para la búsqueda de texto
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (search) params.set('q', search)
      else params.delete('q')
      
      if (estado !== 'TODOS') params.set('estado', estado)
      else params.delete('estado')
      
      // Reset page to 1 when filters change
      params.delete('page')

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    }, 400) // 400ms debounce

    return () => clearTimeout(timer)
  }, [search, estado, pathname, router, searchParams])

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-background border border-border/60 p-3 rounded-xl shadow-sm">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por nombre, marca o modelo..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 w-full bg-muted/20"
        />
      </div>
      <Select value={estado} onValueChange={(val) => setEstado(val || 'TODOS')}>
        <SelectTrigger className="w-full sm:w-[180px] bg-muted/20">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TODOS">Todos los estados</SelectItem>
          <SelectItem value="DISPONIBLE">Disponible</SelectItem>
          <SelectItem value="EN_NEGOCIACION">En Negociación</SelectItem>
          <SelectItem value="RESERVADO">Reservado</SelectItem>
          <SelectItem value="VENDIDO">Vendido</SelectItem>
          <SelectItem value="INACTIVO">Inactivo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
