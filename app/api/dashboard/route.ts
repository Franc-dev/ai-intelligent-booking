import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireUserRole } from "@/lib/auth-utils"

async function getDashboardData(req: NextRequest, user: any) {
  try {
    // Get user's bookings
    const bookings = await prisma.booking.findMany({
      where: { userId: user.userId },
      include: {
        counselor: {
          select: {
            id: true,
            name: true,
            specialties: true,
          }
        }
      },
      orderBy: { scheduledAt: 'desc' }
    })

    // Calculate stats
    const totalBookings = bookings.length
    const upcomingBookings = bookings.filter((booking: any) => 
      new Date(booking.scheduledAt) > new Date()
    )
    const pastBookings = bookings.filter((booking: any) => 
      new Date(booking.scheduledAt) <= new Date()
    )

    // Get this month's bookings
    const thisMonth = new Date()
    const firstDayOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
    const thisMonthBookings = bookings.filter((booking: any) => 
      new Date(booking.scheduledAt) >= firstDayOfMonth
    )

    return NextResponse.json({
      totalBookings,
      upcomingBookings: upcomingBookings.slice(0, 5), // Limit to 5 upcoming
      pastBookings: pastBookings.slice(0, 10), // Limit to 10 past
      thisMonth: thisMonthBookings.length
    })

  } catch (error) {
    console.error("Dashboard data error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}

export const GET = requireUserRole(getDashboardData)
