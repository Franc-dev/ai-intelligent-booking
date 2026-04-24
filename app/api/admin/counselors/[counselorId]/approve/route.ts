import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ counselorId: string }> }
) {
  const { counselorId } = await params

  const admin = await getCurrentUser()
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let action = "approve"
  let rejectionReason: string | null = null
  const contentType = req.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}))
    action = body.action === "reject" ? "reject" : "approve"
    rejectionReason = body.rejectionReason?.toString()?.trim() || null
  } else {
    const formData = await req.formData().catch(() => null)
    action = formData?.get("action")?.toString() === "reject" ? "reject" : "approve"
    rejectionReason = formData?.get("rejectionReason")?.toString()?.trim() || null
  }

  const counselor = await prisma.counselor.findUnique({
    where: { id: counselorId },
    select: { email: true },
  })
  if (!counselor) {
    return NextResponse.json({ error: "Counselor not found" }, { status: 404 })
  }

  const counselorUser = await prisma.user.findUnique({
    where: { email: counselor.email },
    select: { id: true, role: true, email: true },
  })
  if (!counselorUser || counselorUser.role !== "COUNSELOR") {
    return NextResponse.json({ error: "Counselor user not found" }, { status: 404 })
  }

  const data =
    action === "approve"
      ? {
          counselorApprovalStatus: "APPROVED" as const,
          approvedAt: new Date(),
          approvedByUserId: admin.id,
          rejectionReason: null,
        }
      : {
          counselorApprovalStatus: "REJECTED" as const,
          approvedAt: null,
          approvedByUserId: admin.id,
          rejectionReason,
        }

  await prisma.user.update({
    where: { id: counselorUser.id },
    data,
  })

  await prisma.counselor.update({
    where: { id: counselorId },
    data: { isActive: action === "approve" },
  })

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL("/admin/counselors", req.url))
  }

  return NextResponse.json({ success: true })
}
