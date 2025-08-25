import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { MeetingLinkManager } from "@/lib/meeting-links"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Check if user is an admin
    if (user.role !== "ADMIN") {
      return new Response("Forbidden", { status: 403 })
    }

    // Get meeting links status
    const meetingLinksStatus = await MeetingLinkManager.getAllMeetingLinksStatus()

    // Get current bookings for each link
    const now = new Date()
    const enrichedStatus = await Promise.all(
      meetingLinksStatus.map(async (link) => {
        if (link.isAvailable) {
          return link
        }

        // Find current booking for this link
        const currentBooking = await prisma.booking.findFirst({
          where: {
            meetingLink: link.link,
            scheduledAt: {
              lte: now,
            },
            status: {
              in: ["SCHEDULED", "CONFIRMED"],
            },
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            counselor: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            scheduledAt: "desc",
          },
        })

        return {
          ...link,
          currentBooking: currentBooking || undefined,
        }
      })
    )

    // Calculate statistics
    const total = meetingLinksStatus.length
    const available = meetingLinksStatus.filter(link => link.isAvailable).length
    const inUse = total - available
    const utilization = total > 0 ? Math.round((inUse / total) * 100) : 0

    return NextResponse.json({
      meetingLinks: enrichedStatus,
      stats: {
        total,
        available,
        inUse,
        utilization,
      },
    })
  } catch (error) {
    console.error("Error fetching meeting links status:", error)
    return NextResponse.json({ error: "Failed to fetch meeting links status" }, { status: 500 })
  }
}

