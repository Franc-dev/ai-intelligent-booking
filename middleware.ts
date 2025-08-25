import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "./lib/auth-utils"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes
  const protectedRoutes = ["/dashboard", "/booking", "/counselor", "/admin", "/profile"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Login pages (should not redirect authenticated users)
  const loginPages = ["/user/login", "/counselor/login", "/admin/login"]
  const isLoginPage = loginPages.includes(pathname)

  if (isProtectedRoute) {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      // Redirect to appropriate login page based on the protected route
      if (pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/admin/login", request.url))
      } else if (pathname.startsWith("/counselor")) {
        return NextResponse.redirect(new URL("/counselor/login", request.url))
      } else {
        return NextResponse.redirect(new URL("/user/login", request.url))
      }
    }

    const jwtData = await verifyJWT(token)
    if (!jwtData) {
      // Redirect to appropriate login page based on the protected route
      if (pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/admin/login", request.url))
      } else if (pathname.startsWith("/counselor")) {
        return NextResponse.redirect(new URL("/counselor/login", request.url))
      } else {
        return NextResponse.redirect(new URL("/user/login", request.url))
      }
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

  // Handle login pages - redirect authenticated users to appropriate dashboard
  if (isLoginPage) {
    const token = request.cookies.get("auth-token")?.value
    if (token) {
      const jwtData = await verifyJWT(token)
      if (jwtData) {
        const { role } = jwtData
        // Redirect to appropriate dashboard based on role
        if (role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin/users", request.url))
        } else if (role === "COUNSELOR") {
          return NextResponse.redirect(new URL("/counselor", request.url))
        } else {
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
      }
    }
  }

  // Legacy login redirect (for backward compatibility)
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/user/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
