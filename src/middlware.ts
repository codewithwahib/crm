import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ✅ Routes that don't need login
const publicPaths = ["/login", "/api/login"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ✅ Allow public routes
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // ✅ Check for auth token
  const token = req.cookies.get("auth_token")?.value
  if (!token) {
    // Redirect to login if no token
    const loginUrl = new URL("/login", req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// ✅ Protect all routes except API
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/logout).*)"],
}
