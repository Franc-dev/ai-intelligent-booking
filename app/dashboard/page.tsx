import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Navigation } from "@/components/navigation"
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

  // Only regular users can access the user dashboard
  if (user.role !== "USER") {
    if (user.role === "ADMIN") {
      redirect("/admin/users")
    } else if (user.role === "COUNSELOR") {
      redirect("/counselor")
    }
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
      <Navigation userRole={user.role} userName={user.name} />
      
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Stats Overview */}
        <UserStats
          totalBookings={totalBookings}
          upcomingCount={upcomingBookings.length}
          completedCount={pastBookings.length}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Main Content Grid */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          {/* Upcoming Bookings */}
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
            <UpcomingBookings bookings={upcomingBookings} />
          </div>

          {/* Booking History */}
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            <BookingHistory bookings={pastBookings} />
          </div>
        </div>
      </main>
    </div>
  )
}
