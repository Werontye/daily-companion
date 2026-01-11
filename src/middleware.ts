import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security Headers
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://github.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://accounts.google.com https://github.com https://api.github.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  )

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), camera=(), microphone=(), payment=()'
  )

  // HSTS (HTTP Strict Transport Security) - только для production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // CORS для API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Проверка origin для POST/DELETE запросов (CSRF защита)
    if (request.method === 'POST' || request.method === 'DELETE' || request.method === 'PUT') {
      const origin = request.headers.get('origin')
      const host = request.headers.get('host')

      // В production проверяем origin
      if (process.env.NODE_ENV === 'production' && origin) {
        const allowedOrigins = [
          `https://${host}`,
          process.env.NEXT_PUBLIC_APP_URL,
        ].filter(Boolean)

        if (!allowedOrigins.some(allowed => origin.includes(allowed as string))) {
          return new Response('Forbidden - Invalid origin', { status: 403 })
        }
      }
    }

    // CORS headers для API
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*')
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    )
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    )
  }

  // Handle OPTIONS preflight request
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: response.headers })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
