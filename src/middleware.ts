import { NextResponse, type NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Obtener el token de las cookies
  const sessionToken = request.cookies.get('drivesync_session')?.value
  const isValidSession = sessionToken ? !!(await decrypt(sessionToken)) : false

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

