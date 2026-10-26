import { NextRequest, NextResponse } from 'next/server'
import { SessionCookieManager } from '@/lib/SessionCookieManager'

/**
 * Middleware de borda do Next.js responsável por interceptar a navegação
 * e garantir o redirecionamento entre rotas públicas (`/login`) e privadas (`/dashboard`).
 *
 * @param {NextRequest} req - Requisição de navegação interceptada.
 * @returns {NextResponse} Redirecionamento ou prosseguimento da rota.
 */
export function middleware(req: NextRequest): NextResponse {
  const token = req.cookies.get(SessionCookieManager.ACCESS_TOKEN_KEY)?.value
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if ((pathname === '/login' || pathname === '/') && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (pathname === '/' && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
}
