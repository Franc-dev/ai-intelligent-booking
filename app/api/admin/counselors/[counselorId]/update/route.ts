import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ counselorId: string }> }
) {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { counselorId } = await params
  const formData = await req.formData()

  const name = formData.get("name")?.toString().trim() || "Counselor"
  const bio = formData.get("bio")?.toString().trim() || ""
  const specialtiesRaw = formData.get("specialties")?.toString() || ""
  const specialties = specialtiesRaw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
  const isActive = formData.get("isActive") === "on"

  const counselor = await prisma.counselor.update({
    where: { id: counselorId },
    data: { name, bio, specialties, isActive },
    select: { email: true, name: true },
  })

  await prisma.user.updateMany({
    where: { email: counselor.email, role: "COUNSELOR" },
    data: { name: counselor.name },
  })

  return NextResponse.redirect(new URL("/admin/counselors", req.url))
}
