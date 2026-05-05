import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// This middleware runs on EVERY request before any page renders.
// We use it to protect the /admin routes.
// WHY MIDDLEWARE? It's the fastest way to check auth — no DB round trip,
// just JWT verification on the edge.
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if needed
  const { data: { user } } = await supabase.auth.getUser()

  // If visiting /admin/* without being logged in — redirect to login
  // (In v1.0 we don't have a login page yet, so we'll just show the dashboard)
  // This will be enforced properly in v1.5 when auth is added
  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    // For v1.0: allow access so you can test the editor
    // Uncomment below in v1.5 when you add proper auth:
    // return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Run middleware on all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
