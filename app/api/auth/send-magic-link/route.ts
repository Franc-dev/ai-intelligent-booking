import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as jose from "jose"
import { EmailService } from "@/lib/email-service"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate magic link token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")
    const magicLinkToken = await new jose.SignJWT({ 
      userId: user.id, 
      email: user.email,
      role: user.role,
      type: "magic-link" 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .sign(secret)

    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/verify?token=${magicLinkToken}`

    // Send magic link email using EmailService
    try {
      await EmailService.sendMagicLink({
        userEmail: user.email,
        userName: user.name || user.email,
        magicLink,
      })
      
      console.log("Magic link email sent to", email)
    } catch (emailError) {
      console.error('Failed to send magic link email:', emailError)
      return NextResponse.json({ error: "Failed to send magic link" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: "Magic link sent successfully",
      // Only return magic link in development for testing
      magicLink: process.env.NODE_ENV === "development" ? magicLink : undefined,
    })

  } catch (error) {
    console.error("Send magic link error:", error)
    return NextResponse.json({ error: "Failed to send magic link" }, { status: 500 })
  }
}
