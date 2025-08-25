import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as jose from "jose"
import { EmailService } from "@/lib/email-service"

export async function POST(req: NextRequest) {
  try {
    const { name, email, role = "USER" } = await req.json()

    // Validation
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    if (typeof name !== 'string' || typeof email !== 'string') {
      return NextResponse.json({ error: "Invalid input format" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Create user (no password needed for magic link auth)
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })

    // Create default user preferences
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        timezone: 'UTC',
        notificationSettings: {
          email: true,
          sms: false,
        },
        preferredTimeSlots: [],
      }
    })

    // Generate verification token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")
    const verificationToken = await new jose.SignJWT({ 
      userId: user.id, 
      email: user.email,
      role: user.role,
      type: "verification" 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .sign(secret)

    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/verify?token=${verificationToken}`

    // Send verification email using EmailService
    try {
      await EmailService.sendSignupConfirmation({
        userEmail: email,
        userName: name,
        magicLink,
      })
      
      console.log("User signup email sent to", email)
    } catch (emailError) {
      console.error('Failed to send signup confirmation email:', emailError)
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: "Account created successfully",
      // Only return magic link in development for testing
      magicLink: process.env.NODE_ENV === "development" ? magicLink : undefined,
    }, { status: 201 })

  } catch (error) {
    console.error("User signup error:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
