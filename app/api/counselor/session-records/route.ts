import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== "COUNSELOR" || user.counselorApprovalStatus !== "APPROVED") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const counselor = await prisma.counselor.findUnique({
    where: { email: user.email },
    select: { id: true },
  })

  if (!counselor) {
    return NextResponse.json({ error: "Counselor profile not found" }, { status: 404 })
  }

  let bookingId: string | null = null
  let summary: string | null = null
  let privateNotes: string | null = null
  let qualityRating: number | null = null
  const contentType = req.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    const body = await req.json()
    bookingId = body.bookingId
    summary = body.summary ?? null
    privateNotes = body.privateNotes ?? null
    qualityRating = body.qualityRating ? Number(body.qualityRating) : null
  } else {
    const formData = await req.formData()
    bookingId = formData.get("bookingId")?.toString() ?? null
    summary = formData.get("summary")?.toString() ?? null
    privateNotes = formData.get("privateNotes")?.toString() ?? null
    const rawRating = formData.get("qualityRating")?.toString()
    qualityRating = rawRating ? Number(rawRating) : null
  }
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId is required" }, { status: 400 })
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, counselorId: counselor.id },
    select: { id: true },
  })

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  const record = await prisma.sessionRecord.upsert({
    where: { bookingId },
    update: { summary, privateNotes, qualityRating },
    create: { bookingId, counselorId: counselor.id, summary, privateNotes, qualityRating },
  })

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL("/counselor/records", req.url))
  }

  return NextResponse.json({ success: true, record })
}
