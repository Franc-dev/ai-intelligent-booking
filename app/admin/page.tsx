import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Calendar, CheckSquare, ShieldCheck, Users } from "lucide-react"

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/admin/login")
  if (user.role !== "ADMIN") redirect("/dashboard")

  const [totalUsers, totalCounselors, totalBookings, openApprovals, recordsMissing] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "COUNSELOR" } }),
    prisma.booking.count(),
    prisma.user.count({ where: { role: "COUNSELOR", counselorApprovalStatus: "PENDING" } }),
    prisma.booking.count({ where: { status: "COMPLETED", sessionRecords: { none: {} } } }),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Navigation userRole={user.role} userName={user.name} />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">System management and oversight</p>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <MetricCard title="Users" value={totalUsers} icon={Users} />
          <MetricCard title="Counselors" value={totalCounselors} icon={ShieldCheck} />
          <MetricCard title="Bookings" value={totalBookings} icon={Calendar} />
          <MetricCard title="Pending Approval" value={openApprovals} icon={CheckSquare} />
          <MetricCard title="QA Missing Records" value={recordsMissing} icon={BarChart3} />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild><a href="/admin/users">User Management</a></Button>
          <Button asChild variant="outline"><a href="/admin/counselors">Counselor Management</a></Button>
          <Button asChild variant="outline"><a href="/admin/meeting-links">Meeting Rooms</a></Button>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon: Icon }: { title: string; value: number; icon: any }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
