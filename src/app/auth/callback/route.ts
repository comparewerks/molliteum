// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const finalRedirectPath = requestUrl.origin + '/dashboard'; // Final destination

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(finalRedirectPath);
    }
  }

  // return the user to an error page/home page on error
  console.error("Error in auth callback or no code found.");
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}