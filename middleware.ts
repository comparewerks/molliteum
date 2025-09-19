// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)
  const { data: { session } } = await supabase.auth.getSession()
  const pathname = request.nextUrl.pathname

  // ✅ FIX: Add the invitation confirmation route to your public routes
  const publicRoutes = ['/login', '/admin/login', '/auth/confirm'];

  // If user is not signed in and is trying to access a protected route, redirect
  if (!session && !publicRoutes.includes(pathname) && !pathname.startsWith('/auth/callback')) {
    const url = pathname.startsWith('/admin') ? '/admin/login' : '/login';
    return NextResponse.redirect(new URL(url, request.url));
  }
  
  // If user is signed in, handle redirects away from login pages
  if (session && publicRoutes.includes(pathname)) {
    const userRole = session.user.user_metadata?.role;

    // Redirect admins to the admin section
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin/coaches', request.url));
    }
    
    // Redirect coaches (or anyone else) to the coach dashboard
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