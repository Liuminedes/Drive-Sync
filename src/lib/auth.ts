import { SignJWT, jwtVerify } from 'jose'

// Para producción, esto debería venir de las variables de entorno.
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'super-secret-key-for-jwt-drive-sync-dev'
const key = new TextEncoder().encode(JWT_SECRET_KEY)

export interface SessionPayload {
  userId: string
  tenantId: string
  role: string
  email: string
  name: string
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // El token expirará en 24 horas
    .sign(key)
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    })
    return payload as unknown as SessionPayload
  } catch (error) {
    return null
  }
}
