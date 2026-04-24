import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, Calendar, Star, Clock } from "lucide-react"

export default async function AdminCounselorsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string; activity?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "ADMIN") redirect("/dashboard")

  const counselors = await prisma.counselor.findMany({
    include: {
      availability: { orderBy: { dayOfWeek: "asc" } },
      _count: { select: { bookings: true } },
    },
    orderBy: { name: "asc" },
  })

  const counselorUsers = await prisma.user.findMany({
    where: { role: "COUNSELOR" },
    select: { id: true, email: true, counselorApprovalStatus: true },
  })
  const userByEmail = new Map(counselorUsers.map((u) => [u.email, u]))

  const assignmentSetting = await prisma.bookingAssignmentSetting.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: { selectedCounselors: true },
  })

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const resolvedSearchParams = (await searchParams) || {}
  const q = (resolvedSearchParams.q || "").toLowerCase().trim()
  const statusFilter = (resolvedSearchParams.status || "ALL").toUpperCase()
  const activityFilter = (resolvedSearchParams.activity || "ALL").toUpperCase()

  const enrichedCounselors = counselors.map((counselor) => {
    const counselorUser = userByEmail.get(counselor.email)
    const approvalStatus = counselorUser?.counselorApprovalStatus ?? "PENDING"
    return { counselor, counselorUser, approvalStatus }
  })

  const filteredCounselors = enrichedCounselors.filter(({ counselor, approvalStatus }) => {
    const matchesQuery =
      !q ||
      counselor.name.toLowerCase().includes(q) ||
      counselor.email.toLowerCase().includes(q) ||
      counselor.specialties.some((specialty) => specialty.toLowerCase().includes(q))
    const matchesStatus = statusFilter === "ALL" || approvalStatus === statusFilter
    const matchesActivity =
      activityFilter === "ALL" ||
      (activityFilter === "ACTIVE" && counselor.isActive) ||
      (activityFilter === "INACTIVE" && !counselor.isActive)
    return matchesQuery && matchesStatus && matchesActivity
  })

  const pendingCounselors = enrichedCounselors.filter(({ approvalStatus }) => approvalStatus === "PENDING")

  return (
    <div className="min-h-screen bg-background">
      <Navigation userRole={user.role} userName={user.name} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-sans font-bold text-3xl mb-2">Counselor Management</h1>
          <p className="text-muted-foreground font-sans">Manage counselors, approvals, and profile details.</p>
        </div>

        <Card className="border-2 border-black mb-8">
          <CardHeader>
            <CardTitle className="font-sans font-bold">Filter Counselors</CardTitle>
          </CardHeader>
          <CardContent>
            <form method="get" className="grid md:grid-cols-4 gap-3">
              <input
                name="q"
                defaultValue={resolvedSearchParams.q || ""}
                placeholder="Search name/email/specialty"
                className="border rounded px-3 py-2"
              />
              <select name="status" defaultValue={statusFilter} className="border rounded px-3 py-2">
                <option value="ALL">All Approval Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <select name="activity" defaultValue={activityFilter} className="border rounded px-3 py-2">
                <option value="ALL">All Activity</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <div className="flex gap-2">
                <Button type="submit" className="border-2 border-black">Apply</Button>
                <Button type="button" asChild variant="outline" className="border-2 border-black">
                  <a href="/admin/counselors">Reset</a>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-2 border-black mb-8">
          <CardHeader>
            <CardTitle className="font-sans font-bold">Quick Approvals ({pendingCounselors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingCounselors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending counselors right now.</p>
            ) : (
              <div className="space-y-3">
                {pendingCounselors.map(({ counselor, counselorUser }) => (
                  <div key={`pending-${counselor.id}`} className="flex items-center justify-between border rounded p-3">
                    <div>
                      <p className="font-medium">{counselor.name}</p>
                      <p className="text-xs text-muted-foreground">{counselor.email}</p>
                    </div>
                    {counselorUser && (
                      <div className="flex gap-2">
                        <form action={`/api/admin/counselors/${counselorUser.id}/approve`} method="post">
                          <input type="hidden" name="action" value="approve" />
                          <Button type="submit" size="sm" className="border-2 border-black">Approve</Button>
                        </form>
                        <form action={`/api/admin/counselors/${counselorUser.id}/approve`} method="post">
                          <input type="hidden" name="action" value="reject" />
                          <Button type="submit" size="sm" variant="destructive">Reject</Button>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-black mb-8">
          <CardHeader>
            <CardTitle className="font-sans font-bold">Booking Assignment Scope</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Current mode: {assignmentSetting?.mode ?? "ALL_COUNSELORS"}</p>
            <form action="/api/admin/booking-assignment" method="post" className="flex gap-2">
              <input type="hidden" name="mode" value="ALL_COUNSELORS" />
              <Button type="submit" variant="outline" className="border-2 border-black">Assign to All Counselors</Button>
            </form>
            <form action="/api/admin/booking-assignment" method="post" className="mt-4 space-y-3">
              <input type="hidden" name="mode" value="SELECTED_COUNSELORS" />
              <div className="grid md:grid-cols-2 gap-2">
                {counselors.map((c) => (
                  <label key={`assignment-${c.id}`} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="counselorIds"
                      value={c.id}
                      defaultChecked={assignmentSetting?.selectedCounselors.some((s) => s.counselorId === c.id)}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
              <Button type="submit" className="border-2 border-black">Assign to Selected Counselors</Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-sans flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Total Counselors
              </CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold font-sans">{counselors.length}</div></CardContent>
          </Card>
          <Card className="border-2 border-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-sans flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Active Counselors
              </CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold font-sans">{counselors.filter((c) => c.isActive).length}</div></CardContent>
          </Card>
          <Card className="border-2 border-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-sans flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold font-sans">{counselors.reduce((sum, c) => sum + c._count.bookings, 0)}</div></CardContent>
          </Card>
          <Card className="border-2 border-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-sans flex items-center gap-2">
                <Star className="h-4 w-4" />
                Avg. Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">
                {counselors.length > 0 ? Math.round(counselors.reduce((sum, c) => sum + c._count.bookings, 0) / counselors.length) : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="font-sans font-bold flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Counselors ({filteredCounselors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredCounselors.map(({ counselor, counselorUser, approvalStatus }) => (
                <div key={counselor.id} className="border rounded-lg p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <Badge variant={approvalStatus === "APPROVED" ? "default" : approvalStatus === "REJECTED" ? "destructive" : "secondary"}>
                      {approvalStatus}
                    </Badge>
                    {counselorUser && (
                      <div className="flex gap-2">
                        <form action={`/api/admin/counselors/${counselorUser.id}/approve`} method="post">
                          <input type="hidden" name="action" value="approve" />
                          <Button type="submit" size="sm" variant="outline" className="border-2 border-black">Approve</Button>
                        </form>
                        <form action={`/api/admin/counselors/${counselorUser.id}/approve`} method="post">
                          <input type="hidden" name="action" value="reject" />
                          <Button type="submit" size="sm" variant="destructive">Reject</Button>
                        </form>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-sans font-bold text-lg">{counselor.name}</h3>
                        <Badge variant={counselor.isActive ? "default" : "secondary"} className="font-sans">
                          {counselor.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono">{counselor.email}</span>
                        <span>•</span>
                        <span>{counselor._count.bookings} bookings</span>
                      </div>
                    </div>
                    <Badge variant="outline">Edit below</Badge>
                  </div>

                  <form action={`/api/admin/counselors/${counselor.id}/update`} method="post" className="mb-5 grid md:grid-cols-2 gap-3 border rounded p-3">
                    <input name="name" defaultValue={counselor.name} className="border rounded px-3 py-2" placeholder="Counselor name" />
                    <input
                      name="specialties"
                      defaultValue={counselor.specialties.join(", ")}
                      className="border rounded px-3 py-2"
                      placeholder="specialty1, specialty2"
                    />
                    <textarea
                      name="bio"
                      defaultValue={counselor.bio || ""}
                      className="border rounded px-3 py-2 md:col-span-2 min-h-20"
                      placeholder="Counselor bio"
                    />
                    <label className="text-sm flex items-center gap-2">
                      <input type="checkbox" name="isActive" defaultChecked={counselor.isActive} />
                      Active
                    </label>
                    <div className="md:col-span-2">
                      <Button type="submit" size="sm" variant="outline" className="border-2 border-black">
                        Save Counselor Details
                      </Button>
                    </div>
                  </form>

                  {counselor.specialties.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-sans font-medium text-sm mb-2">Specialties:</h4>
                      <div className="flex flex-wrap gap-2">
                        {counselor.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="font-sans">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {counselor.bio && (
                    <div className="mb-4">
                      <h4 className="font-sans font-medium text-sm mb-2">Bio:</h4>
                      <p className="text-sm text-muted-foreground font-sans">{counselor.bio}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-sans font-medium text-sm mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Availability:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {counselor.availability.map((avail) => (
                        <div key={avail.id} className="text-xs p-2 border rounded bg-muted/50">
                          <div className="font-sans font-medium">{dayNames[avail.dayOfWeek]}</div>
                          <div className="text-muted-foreground">
                            {avail.startTime} - {avail.endTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
