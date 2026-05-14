'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Edit2, Trash2, Plus, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createUser } from '@/actions/users'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'

interface Usuario {
  id: string
  nombre_completo: string
  email: string
  rol: string
  auth_user_id: string
}

export function UsuariosClient({ initialUsuarios, tenantId }: { initialUsuarios: Usuario[], tenantId: string }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState({ nombre_completo: '', email: '', password: '', rol: 'ASESOR' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setUsuarios(initialUsuarios)
  }, [initialUsuarios])

  const handleOpenModal = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUsuario(usuario)
      setFormData({ nombre_completo: usuario.nombre_completo || '', email: usuario.email, password: '', rol: usuario.rol })
    } else {
      setEditingUsuario(null)
      setFormData({ nombre_completo: '', email: '', password: '', rol: 'ASESOR' })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingUsuario) {
        const { error } = await supabase.from('usuarios').update({
          nombre_completo: formData.nombre_completo,
          rol: formData.rol
        }).eq('id', editingUsuario.id)
        
        if (error) throw error
        toast.success('Usuario actualizado')
      } else {
        if (!formData.password || formData.password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres')
        }

        const res = await createUser({
          tenant_id: tenantId,
          nombre_completo: formData.nombre_completo,
          email: formData.email,
          rol: formData.rol,
          passwordPlano: formData.password
        })

        if (!res?.success) throw new Error(res?.error || 'No se pudo crear el usuario')

        toast.success('Usuario creado exitosamente. Ya puede iniciar sesión.')
      }
      setIsModalOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error('Error: ' + err.message)
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar a este usuario?')) return
    try {
      const { error } = await supabase.from('usuarios').delete().eq('id', id)
      if (error) throw error
      toast.success('Usuario eliminado')
      router.refresh()
    } catch (err) {
      toast.error('Error al eliminar el usuario')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Aviso:</strong> La creación de usuarios generará el perfil para asignarle vehículos. Asegúrate de que el usuario se registre en el sistema.
        </p>
        <Button onClick={() => handleOpenModal()} className="h-9 gap-2 shrink-0 ml-4">
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="border border-border/60 rounded-xl bg-white dark:bg-background shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="h-11 hover:bg-transparent">
              <TableHead className="font-medium pl-6">Nombre</TableHead>
              <TableHead className="font-medium">Correo</TableHead>
              <TableHead className="font-medium">Rol</TableHead>
              <TableHead className="text-right font-medium pr-6">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No hay usuarios registrados.
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((usuario) => (
                <TableRow key={usuario.id} className="h-[52px] group hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium tracking-tight pl-6 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary/70" />
                    {usuario.nombre_completo || 'Sin nombre'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{usuario.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={usuario.rol === 'ADMIN' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground'}>
                      {usuario.rol}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1 pr-6">
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleOpenModal(usuario)}>
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all" onClick={() => handleDelete(usuario.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#fafafa] dark:bg-background border-border/40">
          <DialogHeader>
            <DialogTitle>{editingUsuario ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_completo">Nombre Completo</Label>
              <Input id="nombre_completo" value={formData.nombre_completo} onChange={e => setFormData({...formData, nombre_completo: e.target.value})} required placeholder="Ej. Carlos Giraldo" className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required disabled={!!editingUsuario} placeholder="carlos@drivesync.com" className="h-10" />
              {!!editingUsuario && <p className="text-xs text-muted-foreground">El correo no se puede modificar una vez creado.</p>}
            </div>
            {!editingUsuario && (
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required placeholder="Mínimo 6 caracteres" className="h-10" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Select value={formData.rol} onValueChange={val => setFormData({...formData, rol: val || 'ASESOR'})}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Selecciona un rol" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASESOR">Asesor de Ventas</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar Perfil'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
