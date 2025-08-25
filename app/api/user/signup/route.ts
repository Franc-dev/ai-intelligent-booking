import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as jose from "jose"
import { Resend } from "resend"

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

    // Send verification email using Resend
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const { data, error } = await resend.emails.send({
      from: 'AI Booking Agent <noreply@franc-dev.space>',
      to: [email],
      subject: 'Welcome to AI Booking Agent - Account Created',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">🎉 Welcome to AI Booking Agent!</h2>
          <p>Hi ${name},</p>
          <p>Your account has been successfully created. Click the button below to verify your email and start booking counseling sessions:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              🚀 Verify Your Account
            </a>
          </div>
          <p><strong>Or copy this link:</strong></p>
          <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace;">
            ${magicLink}
          </p>
          <p><strong>Important:</strong></p>
          <ul>
            <li>This link will expire in 15 minutes</li>
            <li>You can now book sessions with our expert counselors</li>
            <li>Complete your profile for personalized recommendations</li>
          </ul>
          <p>Need help? Contact us at support@franc-dev.space</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            © 2024 AI Booking Agent. All rights reserved.
          </p>
        </div>
      `,
      text: `Welcome to AI Booking Agent!\n\nHi ${name},\n\nYour account has been successfully created. Use this link to verify your email and start booking counseling sessions:\n\n${magicLink}\n\nThis link will expire in 15 minutes.\n\nNeed help? Contact us at support@franc-dev.space`,
    })

    if (error) {
      console.error('Failed to send email:', error)
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }

    console.log("User signup email sent to", email)

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
