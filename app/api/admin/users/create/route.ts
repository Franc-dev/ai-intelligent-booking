import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser()
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let email: string | null = null
    let name: string | null = null
    let role: string | null = null
    const contentType = req.headers.get("content-type") || ""
    if (contentType.includes("application/json")) {
      const body = await req.json()
      email = body.email
      name = body.name
      role = body.role
    } else {
      const formData = await req.formData()
      email = formData.get("email")?.toString() ?? null
      name = formData.get("name")?.toString() ?? null
      role = formData.get("role")?.toString() ?? null
    }
    const safeRole = role === "ADMIN" || role === "COUNSELOR" ? role : "USER"
    const normalizedEmail = email?.toLowerCase()?.trim()
    const normalizedName = name?.toString()?.trim() || null

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })
    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        name: normalizedName ?? undefined,
        role: safeRole,
        counselorApprovalStatus: safeRole === "COUNSELOR" ? "PENDING" : "APPROVED",
        rejectionReason: safeRole === "COUNSELOR" ? null : undefined,
      },
      create: {
        email: normalizedEmail,
        name: normalizedName,
        role: safeRole,
        counselorApprovalStatus: safeRole === "COUNSELOR" ? "PENDING" : "APPROVED",
      },
    })

    if (safeRole === "COUNSELOR") {
      await prisma.counselor.upsert({
        where: { email: user.email },
        update: {
          name: user.name || "New Counselor",
          isActive: false,
        },
        create: {
          id: user.id,
          email: user.email,
          name: user.name || "New Counselor",
          specialties: [],
          bio: "",
          isActive: false,
        },
      })
    }

    if (!contentType.includes("application/json")) {
      return NextResponse.redirect(new URL("/admin/users", req.url))
    }

    return NextResponse.json({ success: true, user, updatedExisting: Boolean(existingUser) })
  } catch (error) {
    console.error("Admin create user error:", error)
    return NextResponse.json({ error: "Failed to create or update user" }, { status: 500 })
  }
}
