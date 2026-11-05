'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { requireRole } from '@/lib/tenant'

export async function updateUsuario(id: string, data: Record<string, any>) {
  try {
    const { tenantId } = await requireRole('ADMIN')

    // Solo ADMIN o SUPERADMIN pueden actualizar otros usuarios
    const targetUser = await prisma.usuarios.findFirst({
      where: { id, tenant_id: tenantId }
    })

    if (!targetUser) {
      return { success: false, error: 'Usuario no encontrado en este concesionario' }
    }

    const { passwordPlano } = data
    const rest: Record<string, any> = {}
    if (data.nombre_completo) rest.nombre_completo = data.nombre_completo
    if (data.email) rest.email = data.email
    if (data.rol && data.rol !== targetUser.rol) {
      if (!['ADMIN', 'ASESOR'].includes(data.rol)) return { success: false, error: 'Rol inválido' }
      rest.rol = data.rol
    }
    if (passwordPlano) {
      if (passwordPlano.length < 8) return { success: false, error: 'La contraseña debe tener al menos 8 caracteres' }
      const salt = await bcrypt.genSalt(10)
      rest.password_hash = await bcrypt.hash(passwordPlano, salt)
    }

    await prisma.usuarios.update({ where: { id }, data: rest as any })
    revalidatePath('/dashboard/usuarios')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteUsuario(id: string) {
  try {
    const { tenantId, userId } = await requireRole('ADMIN')

    // Evitar que el usuario se elimine a sí mismo
    if (id === userId) {
      return { success: false, error: 'No puedes eliminar tu propia cuenta en sesión' }
    }

    const targetUser = await prisma.usuarios.findFirst({
      where: { id, tenant_id: tenantId }
    })

    if (!targetUser) {
      return { success: false, error: 'Usuario no encontrado en este concesionario' }
    }

    await prisma.usuarios.delete({ where: { id } })
    revalidatePath('/dashboard/usuarios')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
