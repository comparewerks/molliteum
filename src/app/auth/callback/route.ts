// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    // Exchange the temporary code for a user session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after the sign-in process completes
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}