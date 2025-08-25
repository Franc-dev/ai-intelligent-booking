import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCounselorRole } from "@/lib/auth-utils"

async function getCounselorDashboardData(req: NextRequest, user: any) {
  try {
    // Get counselor's sessions
    const sessions = await prisma.booking.findMany({
      where: { counselorId: user.userId },
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
      new Date(session.startTime || session.createdAt) > new Date()
    )
    const pastSessions = sessions.filter((session: any) => 
      new Date(session.startTime || session.createdAt) <= new Date()
    )

    // Get this month's sessions
    const thisMonth = new Date()
    const firstDayOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
    const thisMonthSessions = sessions.filter((session: any) => 
      new Date(session.startTime || session.createdAt) >= firstDayOfMonth
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

export const GET = requireCounselorRole(getCounselorDashboardData)
