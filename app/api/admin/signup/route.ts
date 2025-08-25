import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as jose from "jose"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Valid name is required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Create user with ADMIN role
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name.trim(),
        role: "ADMIN"
      }
    })

    // Create verification token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")
    const token = await new jose.SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      type: "verification"
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .sign(secret)

    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/verify?token=${token}`

    // Send magic link via email using Resend
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const { data, error } = await resend.emails.send({
      from: 'AI Booking Agent <noreply@franc-dev.space>',
      to: [email],
      subject: 'Welcome to AI Booking Agent - Admin Account Created',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">🔐 Welcome to AI Booking Agent!</h2>
          <p>Hi ${name},</p>
          <p>Your administrator account has been successfully created. Click the button below to verify your email and access the admin dashboard:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              🚀 Access Admin Dashboard
            </a>
          </div>
          <p><strong>Or copy this link:</strong></p>
          <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace;">
            ${magicLink}
          </p>
          <p><strong>Important:</strong></p>
          <ul>
            <li>This link will expire in 15 minutes</li>
            <li>You now have full administrative access</li>
            <li>You can manage users, counselors, and system settings</li>
          </ul>
          <p>Need help? Contact us at support@franc-dev.space</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            © 2024 AI Booking Agent. All rights reserved.
          </p>
        </div>
      `,
      text: `Welcome to AI Booking Agent!\n\nHi ${name},\n\nYour administrator account has been successfully created. Use this link to verify your email and access the admin dashboard:\n\n${magicLink}\n\nThis link will expire in 15 minutes.\n\nNeed help? Contact us at support@franc-dev.space`,
    })

    if (error) {
      console.error('Failed to send email:', error)
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }

    console.log("Admin signup email sent to", email)

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully",
      // Only return magic link in development for testing
      magicLink: process.env.NODE_ENV === "development" ? magicLink : undefined,
    })
  } catch (error) {
    console.error("Error creating admin account:", error)
    return NextResponse.json({ error: "Failed to create admin account" }, { status: 500 })
  }
}
