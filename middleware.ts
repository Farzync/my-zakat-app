import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  // Cek jika path diawali dengan /dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const session = await verifySession()
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }
  return NextResponse.next()
}

// Hanya aktif di route dashboard
export const config = {
  matcher: ['/dashboard/:path*'],
}
