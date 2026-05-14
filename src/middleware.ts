import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'super-secret-key-for-jwt-drive-sync-dev'
const key = new TextEncoder().encode(JWT_SECRET_KEY)

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Obtener el token de las cookies
  const sessionToken = request.cookies.get('drivesync_session')?.value
  let isValidSession = false

  // Verificar el token si existe
  if (sessionToken) {
    try {
      await jwtVerify(sessionToken, key, { algorithms: ['HS256'] })
      isValidSession = true
    } catch (err) {
      // Token inválido o expirado
      isValidSession = false
    }
  }

  // Proteger rutas /dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard') && !isValidSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirigir si ya está autenticado y trata de ir a /login
  if (request.nextUrl.pathname === '/login' && isValidSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

