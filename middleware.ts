// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)
  const { data: { session } } = await supabase.auth.getSession()
  const pathname = request.nextUrl.pathname

  // --- FIX IS HERE ---
  // Protect admin routes, EXCLUDING the admin login page itself
  if (!session && pathname.startsWith('/admin') && pathname !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Protect coach dashboard
  if (!session && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect logged-in users away from login pages
  if (session && (pathname === '/admin/login' || pathname === '/login')) {
    // This logic can be improved later to redirect admins vs coaches,
    // but for now, it sends them to the coach dashboard.
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

// Your config object remains the same
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}