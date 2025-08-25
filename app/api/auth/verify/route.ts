import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyJWT } from "@/lib/auth-utils"
import * as jose from "jose"

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Verify the JWT token
    const payload = await verifyJWT(token)
    
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    // Check if it's a magic link token
    if (payload.type !== "magic-link") {
      return NextResponse.json({ error: "Invalid token type" }, { status: 400 })
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate access token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")
    const accessToken = await new jose.SignJWT({ 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      type: "access-token"
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret)

    // Set HTTP-only cookie
    const response = NextResponse.json({ 
      message: "Verification successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

    response.cookies.set("auth-token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
