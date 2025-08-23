import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { UpcomingBookings } from "@/components/dashboard/upcoming-bookings"
import { BookingHistory } from "@/components/dashboard/booking-history"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { UserStats } from "@/components/dashboard/user-stats"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user's bookings
  const [upcomingBookings, pastBookings, totalBookings] = await Promise.all([
    prisma.booking.findMany({
      where: {
        userId: user.id,
        scheduledAt: {
          gte: new Date(),
        },
        status: {
          in: ["SCHEDULED", "CONFIRMED"],
        },
      },
      include: {
        counselor: {
          select: {
            name: true,
            specialties: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    }),
    prisma.booking.findMany({
      where: {
        userId: user.id,
        scheduledAt: {
          lt: new Date(),
        },
      },
      include: {
        counselor: {
          select: {
            name: true,
            specialties: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "desc",
      },
      take: 10,
    }),
    prisma.booking.count({
      where: {
        userId: user.id,
      },
    }),
  ])

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <UserStats
          totalBookings={totalBookings}
          upcomingCount={upcomingBookings.length}
          completedCount={pastBookings.length}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upcoming Bookings */}
          <div className="space-y-6">
            <UpcomingBookings bookings={upcomingBookings} />
          </div>

          {/* Booking History */}
          <div className="space-y-6">
            <BookingHistory bookings={pastBookings} />
          </div>
        </div>
      </main>
    </div>
  )
}
