'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Eye, Trash2, Phone, Mail, MessageSquare, Calendar, ExternalLink } from 'lucide-react'
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
  atendido_por?: string | null
  productos?: {
    titulo: string
    precio_venta: number
    categoria: string
    producto_fotos?: { url: string; es_portada: boolean }[]
  } | null
  usuarios?: {
    nombre_completo: string
  } | null
}

interface Asesor {
  id: string
  nombre_completo: string
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

export function LeadsClient({ initialLeads, asesores }: { initialLeads: Lead[], asesores: Asesor[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [filterEstado, setFilterEstado] = useState<string>('TODOS')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { setLeads(initialLeads) }, [initialLeads])

  const filteredLeads = filterEstado === 'TODOS' ? leads : leads.filter(l => l.estado_lead === filterEstado)

  const LEAD_TO_VEHICULO: Record<string, string | null> = {
    NUEVO: null,
    CONTACTADO: 'EN_NEGOCIACION',
    EN_SEGUIMIENTO: 'RESERVADO',
    CONVERTIDO: 'VENDIDO',
    DESCARTADO: 'DISPONIBLE',
  }

  const handleUpdateEstado = async (leadId: string, nuevoEstado: string) => {
    if (!nuevoEstado) return
    setUpdatingId(leadId)
    try {
      const { error, status, statusText } = await supabase.from('leads').update({ estado_lead: nuevoEstado }).eq('id', leadId)
      if (error) throw new Error(error.message || `Error ${status}: ${statusText}`)
      const lead = leads.find(l => l.id === leadId)
      const nuevoEstadoVehiculo = LEAD_TO_VEHICULO[nuevoEstado]
      if (lead?.producto_id && nuevoEstadoVehiculo) {
        const { error: prodError } = await supabase.from('productos').update({ estado: nuevoEstadoVehiculo }).eq('id', lead.producto_id)
        if (!prodError) toast.success(`Vehículo actualizado a "${nuevoEstadoVehiculo.replace('_', ' ')}"`, { icon: '🚗' })
      }
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, estado_lead: nuevoEstado } : l))
      if (selectedLead?.id === leadId) setSelectedLead(prev => prev ? { ...prev, estado_lead: nuevoEstado } : null)
      toast.success(`Estado actualizado a "${ESTADO_LABELS[nuevoEstado]}"`)
    } catch (err: any) {
      toast.error('Error: ' + (err.message || 'No se pudo actualizar'))
    } finally {
      setUpdatingId(null)
    }
  }

  const handleAssignAsesor = async (leadId: string, asesorId: string) => {
    try {
      const { error } = await supabase.from('leads').update({ atendido_por: asesorId || null }).eq('id', leadId)
      if (error) throw new Error(error.message)
      const asesor = asesores.find(a => a.id === asesorId)
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, atendido_por: asesorId || null, usuarios: asesor ? { nombre_completo: asesor.nombre_completo } : null } : l))
      if (selectedLead?.id === leadId) setSelectedLead(prev => prev ? { ...prev, atendido_por: asesorId || null, usuarios: asesor ? { nombre_completo: asesor.nombre_completo } : null } : null)
      toast.success(asesorId ? `Asignado a ${asesor?.nombre_completo}` : 'Asesor removido')
    } catch (err: any) {
      toast.error('Error: ' + (err.message || 'No se pudo asignar'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este lead?')) return
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

  const stats = {
    total: leads.length,
    nuevos: leads.filter(l => l.estado_lead === 'NUEVO').length,
    contactados: leads.filter(l => l.estado_lead === 'CONTACTADO').length,
    seguimiento: leads.filter(l => l.estado_lead === 'EN_SEGUIMIENTO').length,
    convertidos: leads.filter(l => l.estado_lead === 'CONVERTIDO').length,
  }

  return (
    <div className="space-y-5">
      {/* ── KPI chips ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
        {[
          { label: 'Nuevos',        val: stats.nuevos,      key: 'NUEVO',         color: 'text-blue-600 dark:text-blue-400',   ring: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200',   hover: 'hover:border-blue-300' },
          { label: 'Contactados',   val: stats.contactados, key: 'CONTACTADO',    color: 'text-yellow-600 dark:text-yellow-400', ring: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 ring-2 ring-yellow-200', hover: 'hover:border-yellow-300' },
          { label: 'En Seguimiento',val: stats.seguimiento, key: 'EN_SEGUIMIENTO',color: 'text-purple-600 dark:text-purple-400', ring: 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-200', hover: 'hover:border-purple-300' },
          { label: 'Convertidos',   val: stats.convertidos, key: 'CONVERTIDO',    color: 'text-green-600 dark:text-green-400',  ring: 'border-green-400 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-200',   hover: 'hover:border-green-300' },
          { label: 'Todos',         val: stats.total,       key: 'TODOS',         color: 'text-foreground',                     ring: 'border-primary bg-primary/5 ring-2 ring-primary/20',                          hover: 'hover:border-primary/40' },
        ].map(({ label, val, key, color, ring, hover }) => (
          <button
            key={key}
            onClick={() => setFilterEstado(key)}
            className={`p-3 sm:p-4 rounded-xl border transition-all text-left ${filterEstado === key ? ring : `border-border/60 bg-white dark:bg-background ${hover}`}`}
          >
            <p className="text-xs text-muted-foreground font-medium truncate">{label}</p>
            <p className={`text-xl sm:text-2xl font-bold tracking-tight ${color}`}>{val}</p>
          </button>
        ))}
      </div>

      {/* ── DESKTOP TABLE (md+) ── */}
      <div className="hidden md:block border border-border/60 rounded-xl bg-white dark:bg-background shadow-sm overflow-hidden">
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
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="h-[56px] group hover:bg-muted/30 transition-colors">
                  <TableCell className="pl-5">
                    <div className="font-medium tracking-tight">{lead.nombre_cliente}</div>
                    {lead.usuarios?.nombre_completo && <div className="text-xs text-primary/80 mt-0.5 font-medium">👤 {lead.usuarios.nombre_completo}</div>}
                    {lead.mensaje && <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]" title={lead.mensaje}>💬 {lead.mensaje}</div>}
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
                    ) : <span className="text-xs text-muted-foreground italic">Sin vehículo</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.telefono_cliente}</span>
                      {lead.email_cliente && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {lead.email_cliente}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select value={lead.estado_lead} onValueChange={(val) => handleUpdateEstado(lead.id, val || lead.estado_lead)} disabled={updatingId === lead.id}>
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

      {/* ── MOBILE CARDS (< md) ── */}
      <div className="md:hidden space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 bg-white dark:bg-background rounded-xl border border-border/60 text-muted-foreground">
            <MessageSquare className="w-8 h-8 opacity-40" />
            <p className="text-sm font-medium">No hay leads {filterEstado !== 'TODOS' ? `con ese estado` : 'registrados'}</p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-white dark:bg-background border border-border/60 rounded-xl p-4 shadow-sm space-y-3">
              {/* Header row */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold tracking-tight truncate">{lead.nombre_cliente}</p>
                  {lead.usuarios?.nombre_completo && (
                    <p className="text-xs text-primary/80 font-medium mt-0.5">👤 {lead.usuarios.nombre_completo}</p>
                  )}
                </div>
                <Badge variant="outline" className={`${ESTADO_COLORS[lead.estado_lead] || ''} text-[10px] shrink-0`}>
                  {ESTADO_LABELS[lead.estado_lead] || lead.estado_lead}
                </Badge>
              </div>

              {/* Vehicle */}
              {lead.productos && (
                <div className="flex items-center gap-2.5 bg-muted/30 rounded-lg p-2.5">
                  {lead.productos.producto_fotos?.[0]?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={lead.productos.producto_fotos[0].url} alt="" className="w-10 h-10 rounded-md object-cover border border-border/50 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{lead.productos.titulo}</p>
                    <p className="text-xs text-muted-foreground">${Number(lead.productos.precio_venta).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Mensaje */}
              {lead.mensaje && (
                <p className="text-xs text-muted-foreground line-clamp-2">💬 {lead.mensaje}</p>
              )}

              {/* Contact + date */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.telefono_cliente}</span>
                  {lead.email_cliente && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {lead.email_cliente}</span>}
                </div>
                {lead.created_at && (
                  <span className="flex items-center gap-1 text-right shrink-0" suppressHydrationWarning>
                    <Calendar className="w-3 h-3" /> {formatDate(lead.created_at)}
                  </span>
                )}
              </div>

              {/* Estado selector + actions */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                <Select value={lead.estado_lead} onValueChange={(val) => handleUpdateEstado(lead.id, val || lead.estado_lead)} disabled={updatingId === lead.id}>
                  <SelectTrigger className="h-7 w-auto text-xs border border-border/50 rounded-lg px-2 bg-transparent">
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
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedLead(lead)}>
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(lead.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Detail Modal ── */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="w-[95vw] max-w-[550px] bg-[#fafafa] dark:bg-background border-border/40 max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalle del Lead</DialogTitle>
            <DialogDescription>Información completa del prospecto.</DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4 mt-2">
              <div className="bg-white dark:bg-muted/10 rounded-lg border border-border/50 p-4 space-y-3">
                <h4 className="font-semibold tracking-tight text-sm text-muted-foreground uppercase">Cliente</h4>
                <p className="text-lg font-bold tracking-tight">{selectedLead.nombre_cliente}</p>
                <div className="flex flex-col gap-1.5 text-sm">
                  <a href={`tel:${selectedLead.telefono_cliente}`} className="flex items-center gap-2 text-primary hover:underline"><Phone className="w-4 h-4" /> {selectedLead.telefono_cliente}</a>
                  {selectedLead.email_cliente && <a href={`mailto:${selectedLead.email_cliente}`} className="flex items-center gap-2 text-primary hover:underline"><Mail className="w-4 h-4" /> {selectedLead.email_cliente}</a>}
                </div>
              </div>
              {selectedLead.mensaje && (
                <div className="bg-white dark:bg-muted/10 rounded-lg border border-border/50 p-4 space-y-2">
                  <h4 className="font-semibold tracking-tight text-sm text-muted-foreground uppercase">Mensaje</h4>
                  <p className="text-sm leading-relaxed">{selectedLead.mensaje}</p>
                </div>
              )}
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
              <div className="bg-white dark:bg-muted/10 rounded-lg border border-border/50 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="font-semibold tracking-tight text-sm text-muted-foreground uppercase">Estado</h4>
                    <Select value={selectedLead.estado_lead} onValueChange={(val) => handleUpdateEstado(selectedLead.id, val || selectedLead.estado_lead)}>
                      <SelectTrigger className="h-8 w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NUEVO">🔵 Nuevo</SelectItem>
                        <SelectItem value="CONTACTADO">🟡 Contactado</SelectItem>
                        <SelectItem value="EN_SEGUIMIENTO">🟣 En Seguimiento</SelectItem>
                        <SelectItem value="CONVERTIDO">🟢 Convertido</SelectItem>
                        <SelectItem value="DESCARTADO">⚫ Descartado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold tracking-tight text-sm text-muted-foreground uppercase">Asesor</h4>
                    <Select value={selectedLead.atendido_por || '_none'} onValueChange={(val) => handleAssignAsesor(selectedLead.id, val === '_none' ? '' : (val || ''))}>
                      <SelectTrigger className="h-8 w-full"><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">Sin asignar</SelectItem>
                        {asesores.map(a => <SelectItem key={a.id} value={a.id}>{a.nombre_completo}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span suppressHydrationWarning><Calendar className="w-3 h-3 inline mr-1" />{selectedLead.created_at ? formatDate(selectedLead.created_at) : 'Sin fecha'}</span>
                  <span>Origen: {selectedLead.origen}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`https://wa.me/${selectedLead.telefono_cliente.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 h-10 gap-2 inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent transition-colors">
                  <ExternalLink className="w-4 h-4" /> WhatsApp
                </a>
                <a href={`tel:${selectedLead.telefono_cliente}`} className="flex-1 h-10 gap-2 inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent transition-colors">
                  <Phone className="w-4 h-4" /> Llamar
                </a>
                {selectedLead.email_cliente && (
                  <a href={`mailto:${selectedLead.email_cliente}`} className="flex-1 h-10 gap-2 inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent transition-colors">
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
