import { type NextRequest, NextResponse } from "next/server"
import { createLoginToken } from "@/lib/auth"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    const { token, user } = await createLoginToken(email)

    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/verify?token=${token}`

    // Send magic link via email using Resend
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const { data, error } = await resend.emails.send({
      from: 'AI Booking Agent <noreply@franc-dev.space>',
      to: [email],
      subject: 'Your Magic Link - AI Booking Agent',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">🔐 Magic Link for AI Booking Agent</h2>
          <p>Hi ${user.name || email},</p>
          <p>You requested a magic link to access your account. Click the button below to sign in:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              🚀 Sign In to Your Account
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
      text: `Magic Link for AI Booking Agent\n\nHi ${user.name || email},\n\nYou requested a magic link to access your account. Click the link below to sign in:\n\n${magicLink}\n\nThis link will expire in 15 minutes and can only be used once.\n\nIf you didn't request this link, please ignore this email.\n\nNeed help? Contact us at support@franc-dev.space`,
    })

    if (error) {
      console.error('Failed to send email:', error)
      return NextResponse.json({ error: "Failed to send magic link email" }, { status: 500 })
    }

    console.log("Magic link email sent to", email)

    return NextResponse.json({
      success: true,
      message: "Magic link sent to your email",
      // Only return magic link in development for testing
      magicLink: process.env.NODE_ENV === "development" ? magicLink : undefined,
    })
  } catch (error) {
    console.error("Error sending magic link:", error)
    return NextResponse.json({ error: "Failed to send magic link" }, { status: 500 })
  }
}
