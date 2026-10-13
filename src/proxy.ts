import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Redirects signed-out visitors to /login for the routes in the matcher below
export default withAuth(
  function proxy() {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    "/book/:path*",
    "/admin/:path*",
    "/api/bookings/:path*",
    "/api/admin/:path*",
  ],
}
