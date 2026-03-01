/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(request) {
    // Redirige la racine vers le dashboard
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard/entretien-batiment', request.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      // Si pas de token → next-auth redirige automatiquement vers la page de login
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth/login',
    },
  }
)

// Protège toutes les pages admin et la racine
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/batiments/:path*',
    '/parametrage/:path*',
    '/evaluations/:path*',
    '/profile/:path*',
    '/documentation/:path*',
  ],
}
