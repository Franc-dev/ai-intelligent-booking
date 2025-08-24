import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "./lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes
  const protectedRoutes = ["/dashboard", "/booking", "/counselor", "/admin", "/profile"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const jwtData = await verifyJWT(token)
    if (!jwtData) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Role-based access control
    const { role } = jwtData
    
    // Prevent admins and counselors from accessing user dashboard
    if (pathname === "/dashboard" && (role === "ADMIN" || role === "COUNSELOR")) {
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/users", request.url))
      } else if (role === "COUNSELOR") {
        return NextResponse.redirect(new URL("/counselor", request.url))
      }
    }

    // Prevent non-admins from accessing admin routes
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      if (role === "COUNSELOR") {
        return NextResponse.redirect(new URL("/counselor", request.url))
      } else {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    // Prevent non-counselors from accessing counselor routes
    if (pathname.startsWith("/counselor") && role !== "COUNSELOR") {
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/users", request.url))
      } else {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
  }

  // Redirect authenticated users away from login page
  if (pathname === "/login") {
    const token = request.cookies.get("auth-token")?.value
    if (token) {
      const jwtData = await verifyJWT(token)
      if (jwtData) {
        // Redirect to dashboard - role-based redirect will be handled by the verify route
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
