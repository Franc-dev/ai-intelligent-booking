import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-utils"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const setting = await prisma.bookingAssignmentSetting.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: { selectedCounselors: true },
  })

  return NextResponse.json({ setting })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let mode: string | null = null
  let counselorIds: string[] = []
  const contentType = req.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    const body = await req.json()
    mode = body.mode
    counselorIds = Array.isArray(body.counselorIds) ? body.counselorIds : []
  } else {
    const formData = await req.formData()
    mode = formData.get("mode")?.toString() ?? null
    counselorIds = formData.getAll("counselorIds").map(String)
  }
  const safeMode = mode === "SELECTED_COUNSELORS" ? "SELECTED_COUNSELORS" : "ALL_COUNSELORS"
  const selectedIds = Array.isArray(counselorIds) ? counselorIds.filter(Boolean) : []

  await prisma.bookingAssignmentSetting.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  })

  const setting = await prisma.bookingAssignmentSetting.create({
    data: {
      mode: safeMode,
      isActive: true,
      createdById: user.id,
      selectedCounselors: {
        create: safeMode === "SELECTED_COUNSELORS" ? selectedIds.map((counselorId: string) => ({ counselorId })) : [],
      },
    },
    include: { selectedCounselors: true },
  })

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL("/admin/counselors", req.url))
  }

  return NextResponse.json({ success: true, setting })
}
