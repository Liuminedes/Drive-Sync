'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Eye, Trash2, Phone, Mail, MessageSquare, Car, Calendar, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Lead {
  id: string
  nombre_cliente: string
  email_cliente: string | null
  telefono_cliente: string
  mensaje: string | null
  estado_lead: string
  origen: string
  created_at?: string
  producto_id: string | null
  productos?: {
    titulo: string
    precio_venta: number
    categoria: string
    producto_fotos?: { url: string; es_portada: boolean }[]
  } | null
}

const ESTADO_COLORS: Record<string, string> = {
  NUEVO: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  CONTACTADO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  EN_SEGUIMIENTO: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  CONVERTIDO: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800',
  DESCARTADO: 'bg-gray-100 text-gray-500 dark:bg-gray-800/40 dark:text-gray-400 border-gray-200 dark:border-gray-700',
}

const ESTADO_LABELS: Record<string, string> = {
  NUEVO: 'Nuevo',
  CONTACTADO: 'Contactado',
  EN_SEGUIMIENTO: 'En Seguimiento',
  CONVERTIDO: 'Convertido',
  DESCARTADO: 'Descartado',
}

export function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [filterEstado, setFilterEstado] = useState<string>('TODOS')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setLeads(initialLeads)
  }, [initialLeads])

  const filteredLeads = filterEstado === 'TODOS'
    ? leads
    : leads.filter(l => l.estado_lead === filterEstado)

  const handleUpdateEstado = async (leadId: string, nuevoEstado: string) => {
    setUpdatingId(leadId)
    try {
      const { error } = await supabase
        .from('leads')
        .update({ estado_lead: nuevoEstado })
        .eq('id', leadId)

      if (error) throw error

      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, estado_lead: nuevoEstado } : l))
      
      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => prev ? { ...prev, estado_lead: nuevoEstado } : null)
      }

      toast.success(`Estado actualizado a "${ESTADO_LABELS[nuevoEstado]}"`)
    } catch (err) {
      toast.error('Error al actualizar el estado')
      console.error(err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este lead? Esta acción no se puede deshacer.')) return
    try {
      const { error } = await supabase.from('leads').delete().eq('id', id)
      if (error) throw error
      setLeads(prev => prev.filter(l => l.id !== id))
      if (selectedLead?.id === id) setSelectedLead(null)
      toast.success('Lead eliminado')
    } catch (err) {
      toast.error('Error al eliminar el lead')
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  // Stats
  const stats = {
    total: leads.length,
    nuevos: leads.filter(l => l.estado_lead === 'NUEVO').length,
    contactados: leads.filter(l => l.estado_lead === 'CONTACTADO').length,
    seguimiento: leads.filter(l => l.estado_lead === 'EN_SEGUIMIENTO').length,
    convertidos: leads.filter(l => l.estado_lead === 'CONVERTIDO').length,
    descartados: leads.filter(l => l.estado_lead === 'DESCARTADO').length,
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button onClick={() => setFilterEstado('NUEVO')} className={`p-4 rounded-xl border transition-all text-left ${filterEstado === 'NUEVO' ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-border/60 bg-white dark:bg-background hover:border-blue-300'}`}>
          <p className="text-xs text-muted-foreground font-medium">Nuevos</p>
          <p className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">{stats.nuevos}</p>
        </button>
        <button onClick={() => setFilterEstado('CONTACTADO')} className={`p-4 rounded-xl border transition-all text-left ${filterEstado === 'CONTACTADO' ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 ring-2 ring-yellow-200 dark:ring-yellow-800' : 'border-border/60 bg-white dark:bg-background hover:border-yellow-300'}`}>
          <p className="text-xs text-muted-foreground font-medium">Contactados</p>
          <p className="text-2xl font-bold tracking-tight text-yellow-600 dark:text-yellow-400">{stats.contactados}</p>
        </button>
        <button onClick={() => setFilterEstado('EN_SEGUIMIENTO')} className={`p-4 rounded-xl border transition-all text-left ${filterEstado === 'EN_SEGUIMIENTO' ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-200 dark:ring-purple-800' : 'border-border/60 bg-white dark:bg-background hover:border-purple-300'}`}>
          <p className="text-xs text-muted-foreground font-medium">En Seguimiento</p>
          <p className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">{stats.seguimiento}</p>
        </button>
        <button onClick={() => setFilterEstado('CONVERTIDO')} className={`p-4 rounded-xl border transition-all text-left ${filterEstado === 'CONVERTIDO' ? 'border-green-400 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-200 dark:ring-green-800' : 'border-border/60 bg-white dark:bg-background hover:border-green-300'}`}>
          <p className="text-xs text-muted-foreground font-medium">Convertidos</p>
          <p className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-400">{stats.convertidos}</p>
        </button>
        <button onClick={() => setFilterEstado('TODOS')} className={`p-4 rounded-xl border transition-all text-left ${filterEstado === 'TODOS' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border/60 bg-white dark:bg-background hover:border-primary/40'}`}>
          <p className="text-xs text-muted-foreground font-medium">Todos</p>
          <p className="text-2xl font-bold tracking-tight">{stats.total}</p>
        </button>
      </div>

      {/* Table */}
      <div className="border border-border/60 rounded-xl bg-white dark:bg-background shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="h-11 hover:bg-transparent">
              <TableHead className="font-medium pl-5">Cliente</TableHead>
              <TableHead className="font-medium">Vehículo Interesado</TableHead>
              <TableHead className="font-medium">Contacto</TableHead>
              <TableHead className="font-medium">Estado</TableHead>
              <TableHead className="font-medium">Fecha</TableHead>
              <TableHead className="text-right font-medium pr-5">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/40" />
                    <p className="font-medium">No hay leads {filterEstado !== 'TODOS' ? `con estado "${ESTADO_LABELS[filterEstado]}"` : 'registrados'}</p>
                    <p className="text-xs">Los leads aparecerán aquí cuando un cliente llene el formulario de contacto desde el catálogo.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="h-[56px] group hover:bg-muted/30 transition-colors">
                  <TableCell className="pl-5">
                    <div className="font-medium tracking-tight">{lead.nombre_cliente}</div>
                    {lead.mensaje && (
                      <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]" title={lead.mensaje}>
                        💬 {lead.mensaje}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.productos ? (
                      <div className="flex items-center gap-2">
                        {lead.productos.producto_fotos?.[0]?.url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={lead.productos.producto_fotos[0].url} alt="" className="w-8 h-8 rounded object-cover border border-border/50" />
                        )}
                        <div>
                          <div className="text-sm font-medium truncate max-w-[180px]">{lead.productos.titulo}</div>
                          <div className="text-xs text-muted-foreground">${Number(lead.productos.precio_venta).toLocaleString()}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Sin vehículo</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.telefono_cliente}</span>
                      {lead.email_cliente && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {lead.email_cliente}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={lead.estado_lead}
                      onValueChange={(val) => handleUpdateEstado(lead.id, val || lead.estado_lead)}
                      disabled={updatingId === lead.id}
                    >
                      <SelectTrigger className="h-7 w-[140px] text-xs border-0 bg-transparent p-0">
                        <Badge variant="outline" className={`${ESTADO_COLORS[lead.estado_lead] || ''} text-xs cursor-pointer`}>
                          {ESTADO_LABELS[lead.estado_lead] || lead.estado_lead}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NUEVO">🔵 Nuevo</SelectItem>
                        <SelectItem value="CONTACTADO">🟡 Contactado</SelectItem>
                        <SelectItem value="EN_SEGUIMIENTO">🟣 En Seguimiento</SelectItem>
                        <SelectItem value="CONVERTIDO">🟢 Convertido</SelectItem>
                        <SelectItem value="DESCARTADO">⚫ Descartado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap" suppressHydrationWarning>
                    {lead.created_at ? formatDate(lead.created_at) : '—'}
                  </TableCell>
                  <TableCell className="text-right space-x-1 pr-5 whitespace-nowrap">
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setSelectedLead(lead)}>
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all" onClick={() => handleDelete(lead.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="sm:max-w-[550px] bg-[#fafafa] dark:bg-background border-border/40">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalle del Lead</DialogTitle>
            <DialogDescription>Información completa del prospecto.</DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-6 mt-2">
              {/* Client Info */}
              <div className="bg-white dark:bg-muted/10 rounded-lg border border-border/50 p-4 space-y-3">
                <h4 className="font-semibold tracking-tight text-sm text-muted-foreground uppercase">Cliente</h4>
                <div className="space-y-2">
                  <p className="text-lg font-bold tracking-tight">{selectedLead.nombre_cliente}</p>
                  <div className="flex flex-col gap-1.5 text-sm">
                    <a href={`tel:${selectedLead.telefono_cliente}`} className="flex items-center gap-2 text-primary hover:underline">
                      <Phone className="w-4 h-4" /> {selectedLead.telefono_cliente}
                    </a>
                    {selectedLead.email_cliente && (
                      <a href={`mailto:${selectedLead.email_cliente}`} className="flex items-center gap-2 text-primary hover:underline">
                        <Mail className="w-4 h-4" /> {selectedLead.email_cliente}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedLead.mensaje && (
                <div className="bg-white dark:bg-muted/10 rounded-lg border border-border/50 p-4 space-y-2">
                  <h4 className="font-semibold tracking-tight text-sm text-muted-foreground uppercase">Mensaje</h4>
                  <p className="text-sm leading-relaxed">{selectedLead.mensaje}</p>
                </div>
              )}

              {/* Vehicle */}
              {selectedLead.productos && (
                <div className="bg-white dark:bg-muted/10 rounded-lg border border-border/50 p-4 space-y-3">
                  <h4 className="font-semibold tracking-tight text-sm text-muted-foreground uppercase">Vehículo de Interés</h4>
                  <div className="flex items-center gap-3">
                    {selectedLead.productos.producto_fotos?.[0]?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={selectedLead.productos.producto_fotos[0].url} alt="" className="w-16 h-16 rounded-lg object-cover border border-border/50" />
                    )}
                    <div>
                      <p className="font-semibold tracking-tight">{selectedLead.productos.titulo}</p>
                      <p className="text-lg font-bold text-primary tracking-tighter">${Number(selectedLead.productos.precio_venta).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status + Meta */}
              <div className="flex items-center justify-between bg-white dark:bg-muted/10 rounded-lg border border-border/50 p-4">
                <div className="space-y-1">
                  <h4 className="font-semibold tracking-tight text-sm text-muted-foreground uppercase">Estado Actual</h4>
                  <Select
                    value={selectedLead.estado_lead}
                    onValueChange={(val) => handleUpdateEstado(selectedLead.id, val || selectedLead.estado_lead)}
                  >
                    <SelectTrigger className="h-8 w-[170px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NUEVO">🔵 Nuevo</SelectItem>
                      <SelectItem value="CONTACTADO">🟡 Contactado</SelectItem>
                      <SelectItem value="EN_SEGUIMIENTO">🟣 En Seguimiento</SelectItem>
                      <SelectItem value="CONVERTIDO">🟢 Convertido</SelectItem>
                      <SelectItem value="DESCARTADO">⚫ Descartado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Calendar className="w-3 h-3" /> {selectedLead.created_at ? formatDate(selectedLead.created_at) : 'Sin fecha'}</p>
                  <p className="text-xs text-muted-foreground">Origen: {selectedLead.origen}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${selectedLead.telefono_cliente.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-10 gap-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> WhatsApp
                </a>
                <a
                  href={`tel:${selectedLead.telefono_cliente}`}
                  className="flex-1 h-10 gap-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Phone className="w-4 h-4" /> Llamar
                </a>
                {selectedLead.email_cliente && (
                  <a
                    href={`mailto:${selectedLead.email_cliente}`}
                    className="flex-1 h-10 gap-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Mail className="w-4 h-4" /> Email
                  </a>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
