'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { requireRole } from '@/lib/tenant'

export async function createUser(data: {
  tenant_id?: string
  nombre_completo: string
  email: string
  rol: string
  passwordPlano: string
}) {
  try {
    const session = await requireRole('ADMIN')
    // El tenant_id siempre proviene de la sesión verificada del admin que crea el usuario
    const tenantId = session.tenantId

    if (!['ADMIN', 'ASESOR'].includes(data.rol)) return { success: false, error: 'Rol inválido' }
    if (!data.passwordPlano || data.passwordPlano.length < 8) return { success: false, error: 'La contraseña debe tener al menos 8 caracteres' }

    // 1. Verificar si el email ya existe en la tabla usuarios
    const existingUser = await prisma.usuarios.findUnique({
      where: { email: data.email },
      select: { id: true }
    })

    if (existingUser) {
      return { success: false, error: 'El correo ya está registrado en el sistema' }
    }

    // 2. Hashear la contraseña
    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(data.passwordPlano, salt)

    // 3. Insertar el usuario asociado al tenant
    await prisma.usuarios.create({
      data: {
        tenant_id: tenantId,
        nombre_completo: data.nombre_completo,
        email: data.email,
        rol: data.rol,
        password_hash: password_hash
      }
    })

    return { success: true }
  } catch (err: any) {
    console.error('Error al crear usuario:', err)
    return { success: false, error: err.message || 'Error interno al crear el usuario' }
  }
}
