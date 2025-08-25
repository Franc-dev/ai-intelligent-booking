import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as jose from "jose"
import { Resend } from "resend"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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

    // Ensure user has COUNSELOR role
    if (user.role !== "COUNSELOR") {
      return NextResponse.json({ error: "Access denied. This endpoint is for counselors only." }, { status: 403 })
    }

    // Generate magic link token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")
    const token = await new jose.SignJWT({ 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      type: "magic-link"
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .sign(secret)

    // Create magic link
    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/verify?token=${token}`

    // Send magic link via email using Resend
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const { data, error } = await resend.emails.send({
      from: 'AI Booking Agent <noreply@franc-dev.space>',
      to: [email],
      subject: 'Your Magic Link - AI Booking Agent Counselor',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">🔐 Magic Link for AI Booking Agent</h2>
          <p>Hi ${user.name || email},</p>
          <p>You requested a magic link to access your counselor account. Click the button below to sign in:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              🚀 Sign In to Counselor Dashboard
            </a>
          </div>
          <p><strong>Or copy this link:</strong></p>
          <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace;">
            ${magicLink}
          </p>
          <p><strong>Important:</strong></p>
          <ul>
            <li>This link will expire in 15 minutes</li>
            <li>If you didn't request this link, please ignore this email</li>
            <li>For security, this link can only be used once</li>
          </ul>
          <p>Need help? Contact us at support@franc-dev.space</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            © 2024 AI Booking Agent. All rights reserved.
          </p>
        </div>
      `,
      text: `Magic Link for AI Booking Agent Counselor\n\nHi ${user.name || email},\n\nYou requested a magic link to access your counselor account. Click the link below to sign in:\n\n${magicLink}\n\nThis link will expire in 15 minutes and can only be used once.\n\nIf you didn't request this link, please ignore this email.\n\nNeed help? Contact us at support@franc-dev.space`,
    })

    if (error) {
      console.error('Failed to send email:', error)
      return NextResponse.json({ error: "Failed to send magic link email" }, { status: 500 })
    }

    console.log("Magic link email sent to", email)
    
    return NextResponse.json({ 
      success: true,
      message: "Magic link sent successfully",
      // Only return magic link in development for testing
      magicLink: process.env.NODE_ENV === "development" ? magicLink : undefined
    })

  } catch (error) {
    console.error("Counselor login error:", error)
    return NextResponse.json({ error: "Failed to send magic link" }, { status: 500 })
  }
}
