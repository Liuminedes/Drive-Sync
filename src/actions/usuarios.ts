'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function updateUsuario(id: string, data: Record<string, any>) {
  try {
    const { passwordPlano, ...rest } = data
    if (passwordPlano) {
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
    await prisma.usuarios.delete({ where: { id } })
    revalidatePath('/dashboard/usuarios')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
