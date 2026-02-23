import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// This is the default NextAuth middleware
export default withAuth(
  function middleware(req) {
    // Optional: Log here to see if middleware is running
    // console.log("Middleware running for:", req.nextUrl.pathname)
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
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
