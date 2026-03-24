import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl
        // Protect app routes
        if (pathname.startsWith('/feed') || 
            pathname.startsWith('/compose') || 
            pathname.startsWith('/settings')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/feed/:path*', '/compose/:path*', '/settings/:path*'],
}
