import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminRole } from "@/lib/auth-utils"

async function getAdminDashboardData(req: NextRequest, user: any) {
  try {
    // Get system-wide stats (only admins can access)
    const totalUsers = await prisma.user.count()
    const totalCounselors = await prisma.user.count({ where: { role: "COUNSELOR" } })
    const totalBookings = await prisma.booking.count()
    
    // Get recent activity
    const recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        counselor: { select: { name: true, email: true } }
      }
    })

    // Get this month's stats
    const thisMonth = new Date()
    const firstDayOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
    const thisMonthBookings = await prisma.booking.count({
      where: { createdAt: { gte: firstDayOfMonth } }
    })

    return NextResponse.json({
      totalUsers,
      totalCounselors,
      totalBookings,
      thisMonthBookings,
      recentBookings
    })

  } catch (error) {
    console.error("Admin dashboard data error:", error)
    return NextResponse.json({ error: "Failed to fetch admin dashboard data" }, { status: 500 })
  }
}

export const GET = requireAdminRole(getAdminDashboardData)

