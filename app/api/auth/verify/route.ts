import { type NextRequest, NextResponse } from "next/server"
import { verifyLoginToken, createJWT } from "@/lib/auth"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    const user = await verifyLoginToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    // Create JWT and set cookie
    const jwt = await createJWT(user.id, user.role)
    const cookieStore = await cookies()

    cookieStore.set("auth-token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    // Redirect based on user role
    let redirectUrl = "/dashboard" // Default for regular users
    
    console.log(`User data:`, { id: user.id, email: user.email, role: user.role })
    
    if (user.role === "ADMIN") {
      redirectUrl = "/admin/users"
    } else if (user.role === "COUNSELOR") {
      redirectUrl = "/counselor"
    }
    
    console.log(`User role: ${user.role}, redirecting to: ${redirectUrl}`)
    
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  } catch (error) {
    console.error("Error verifying token:", error)
    return NextResponse.json({ error: "Failed to verify token" }, { status: 500 })
  }
}
