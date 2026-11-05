'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Building2, Users, Car, Download, Plus, ShieldCheck, RefreshCw } from 'lucide-react'
import { createTenantWithAdmin } from '@/actions/superadmin'
import toast from 'react-hot-toast'

interface SuperAdminDashboardProps {
  metrics: {
    tenantsCount: number
    usersCount: number
    vehiclesCount: number
    leadsCount: number
  }
  tenants: Array<{
    id: string
    nombre: string
    dominio_personalizado: string | null
    created_at: Date | string | null
    vehiculos_count: number
    usuarios_count: number
    leads_count: number
  }>
  currentTenantId: string
}

export function SuperAdminClient({ metrics, tenants, currentTenantId }: SuperAdminDashboardProps) {
  const tenantsList = tenants
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Formulario nuevo tenant
  const [nombre, setNombre] = useState('')
  const [dominio, setDominio] = useState('')
  const [adminNombre, setAdminNombre] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')

  // Backup .zip (datos + imágenes) generado por /api/backup/export
  const exportUrl = (tenantId: string) => `/api/backup/export?tenantId=${tenantId}`

  // 3. Crear nueva empresa / tenant
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await createTenantWithAdmin({
        nombre,
        dominio_personalizado: dominio || undefined,
        admin_nombre: adminNombre,
        admin_email: adminEmail,
        admin_password: adminPassword
      })

      if (!res.success) throw new Error(res.error)

      toast.success(`Concesionario "${nombre}" creado exitosamente con su administrador`)
      setIsModalOpen(false)
      // Limpiar formulario
      setNombre('')
      setDominio('')
      setAdminNombre('')
      setAdminEmail('')
      setAdminPassword('')
      setTimeout(() => { window.location.reload() }, 1000)
    } catch (err: any) {
      toast.error(err.message || 'Error al crear concesionario')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Panel SuperAdmin & Multi-Tenant</h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
              <ShieldCheck className="w-3 h-3 mr-1 inline" /> Control Global
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Administra todas las empresas, sucursales y gestiona backups completos para migración de servidores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a href={exportUrl(currentTenantId)} download>
            <Button variant="outline" className="gap-2 shadow-sm border-primary/30 text-primary hover:bg-primary/5">
              <Download className="w-4 h-4" />
              <span>Descargar mi backup</span>
            </Button>
          </a>

          {/* Modal Crear Concesionario */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <Button className="gap-2 shadow-sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4" />
              <span>Nueva Empresa</span>
            </Button>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Empresa / Concesionario</DialogTitle>
                <DialogDescription>
                  Crea un nuevo tenant aislado en Drive Sync con su usuario administrador principal.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateTenant} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Nombre del Concesionario</label>
                  <Input
                    placeholder="Ej. Autos del Valle Pereira"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Dominio o Slug (Opcional)</label>
                  <Input
                    placeholder="Ej. autosdelvalle.com"
                    value={dominio}
                    onChange={(e) => setDominio(e.target.value)}
                  />
                </div>

                <div className="border-t border-border/50 pt-3 space-y-3">
                  <h4 className="text-sm font-semibold">Datos del Administrador Inicial</h4>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Nombre Completo</label>
                    <Input
                      placeholder="Ej. Carlos Restrepo"
                      value={adminNombre}
                      onChange={(e) => setAdminNombre(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Correo Electrónico</label>
                      <Input
                        type="email"
                        placeholder="carlos@concesionario.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Contraseña</label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creando...' : 'Crear Concesionario'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards Globales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Concesionarios (Tenants)</CardTitle>
            <Building2 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.tenantsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Empresas activas en la nube</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehículos</CardTitle>
            <Car className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.vehiclesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">En catálogo de todas las marcas</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Usuarios</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.usersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Admins y asesores comerciales</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prospectos (Leads)</CardTitle>
            <RefreshCw className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.leadsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Registrados en la plataforma</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Concesionarios */}
      <div className="rounded-xl border border-border/60 bg-white dark:bg-background overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="font-semibold text-base">Empresas Registradas en Drive Sync</h3>
          <span className="text-xs text-muted-foreground">{tenantsList.length} empresas registradas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-medium">
              <tr>
                <th className="px-5 py-3">Concesionario / Empresa</th>
                <th className="px-4 py-3">Vehículos</th>
                <th className="px-4 py-3">Asesores</th>
                <th className="px-4 py-3">Leads</th>
                <th className="px-4 py-3">Dominio / Slug</th>
                <th className="px-5 py-3 text-right">Acciones de Migración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {tenantsList.map((t) => (
                <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      {t.nombre}
                      {t.id === currentTenantId && (
                        <Badge variant="secondary" className="text-[10px] h-4">Actual</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">ID: {t.id}</div>
                  </td>
                  <td className="px-4 py-3.5 font-medium">{t.vehiculos_count} autos</td>
                  <td className="px-4 py-3.5">{t.usuarios_count} usuarios</td>
                  <td className="px-4 py-3.5">{t.leads_count} prospectos</td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {t.dominio_personalizado || 'drivesync.app'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <a href={exportUrl(t.id)} download>
                      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                        <Download className="w-3.5 h-3.5" />
                        Descargar Backup
                      </Button>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
