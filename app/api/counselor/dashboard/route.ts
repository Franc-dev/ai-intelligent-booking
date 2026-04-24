import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApprovedCounselorRole } from "@/lib/auth-utils"

async function getCounselorDashboardData(req: NextRequest, user: any) {
  try {
    const counselor = await prisma.counselor.findUnique({
      where: { email: user.email },
      select: { id: true },
    })

    if (!counselor) {
      return NextResponse.json({ error: "Counselor profile not found" }, { status: 404 })
    }

    // Get counselor's sessions
    const sessions = await prisma.booking.findMany({
      where: { counselorId: counselor.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate stats
    const totalSessions = sessions.length
    const upcomingSessions = sessions.filter((session: any) => 
      new Date(session.scheduledAt) > new Date()
    )
    const pastSessions = sessions.filter((session: any) => 
      new Date(session.scheduledAt) <= new Date()
    )

    // Get this month's sessions
    const thisMonth = new Date()
    const firstDayOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
    const thisMonthSessions = sessions.filter((session: any) => 
      new Date(session.scheduledAt) >= firstDayOfMonth
    )

    return NextResponse.json({
      totalSessions,
      upcomingSessions: upcomingSessions.slice(0, 5), // Limit to 5 upcoming
      pastSessions: pastSessions.slice(0, 10), // Limit to 10 past
      thisMonth: thisMonthSessions.length
    })

  } catch (error) {
    console.error("Counselor dashboard data error:", error)
    return NextResponse.json({ error: "Failed to fetch counselor dashboard data" }, { status: 500 })
  }
}

export const GET = requireApprovedCounselorRole(getCounselorDashboardData)
