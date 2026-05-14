'use server'

import { cookies } from 'next/headers'
import { encrypt, decrypt } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function login(email: string, passwordPlano: string) {
  const supabase = await createClient()

  try {
    // Buscar al usuario en la base de datos
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !usuario) {
      return { success: false, error: 'Credenciales incorrectas' }
    }

    if (!usuario.password_hash) {
      return { success: false, error: 'Usuario no tiene contraseña configurada' }
    }

    // Verificar la contraseña usando bcrypt
    const passwordMatch = await bcrypt.compare(passwordPlano, usuario.password_hash)
    
    if (!passwordMatch) {
      return { success: false, error: 'Credenciales incorrectas' }
    }

    // Crear la sesión
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    const sessionPayload = {
      userId: usuario.id,
      tenantId: usuario.tenant_id,
      role: usuario.rol,
      email: usuario.email,
      name: usuario.nombre_completo
    }
    
    const sessionToken = await encrypt(sessionPayload)

    // Guardar la cookie HttpOnly
    const cookieStore = await cookies()
    cookieStore.set('drivesync_session', sessionToken, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })

    return { success: true }
  } catch (err: any) {
    console.error('Error en login:', err)
    return { success: false, error: 'Ocurrió un error inesperado al iniciar sesión' }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.set('drivesync_session', '', {
    expires: new Date(0),
    httpOnly: true,
    path: '/'
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('drivesync_session')?.value
  
  if (!sessionToken) return null
  
  return await decrypt(sessionToken)
}
