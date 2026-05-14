'use server'

import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function createUser(data: {
  tenant_id: string
  nombre_completo: string
  email: string
  rol: string
  passwordPlano: string
}) {
  try {
    const supabase = await createClient()

    // 1. Verificar si el email ya existe en la tabla usuarios
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', data.email)
      .single()

    if (existingUser) {
      return { success: false, error: 'El correo ya está registrado en el sistema' }
    }

    // 2. Hashear la contraseña
    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(data.passwordPlano, salt)

    // 3. Insertar el usuario
    const { error } = await supabase.from('usuarios').insert({
      tenant_id: data.tenant_id,
      nombre_completo: data.nombre_completo,
      email: data.email,
      rol: data.rol,
      password_hash: password_hash
    })

    if (error) throw error

    return { success: true }
  } catch (err: any) {
    console.error('Error al crear usuario:', err)
    return { success: false, error: err.message || 'Error interno al crear el usuario' }
  }
}
