// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)
  const { data: { session } } = await supabase.auth.getSession()
  const pathname = request.nextUrl.pathname

  // List of all public routes
  const publicRoutes = ['/login', '/admin/login'];

  // If user is not signed in and is trying to access a protected route
  if (!session && !publicRoutes.includes(pathname) && !pathname.startsWith('/auth/callback')) {
    const url = pathname.startsWith('/admin') ? '/admin/login' : '/login';
    return NextResponse.redirect(new URL(url, request.url));
  }
  
  // If user is signed in and tries to access a public login page
  if (session && publicRoutes.includes(pathname)) {
    // We can add role-based redirects here later if needed (admin vs coach)
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}