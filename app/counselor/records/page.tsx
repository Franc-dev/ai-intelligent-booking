import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function CounselorRecordsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "COUNSELOR") redirect("/dashboard")
  if (user.counselorApprovalStatus !== "APPROVED") redirect("/counselor/pending")

  const counselor = await prisma.counselor.findUnique({
    where: { email: user.email },
    select: { id: true },
  })
  if (!counselor) redirect("/counselor/pending")

  const bookings = await prisma.booking.findMany({
    where: { counselorId: counselor.id, status: { in: ["CONFIRMED", "COMPLETED"] } },
    include: {
      user: { select: { name: true, email: true } },
      sessionRecords: true,
    },
    orderBy: { scheduledAt: "desc" },
    take: 20,
  })

  return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Session Records</h1>
        <p className="text-muted-foreground mb-6">Create and manage session records for your bookings.</p>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{booking.user.name || booking.user.email}</span>
                  <Badge>{booking.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {booking.scheduledAt.toLocaleString()}
                </p>
                <form action="/api/counselor/session-records" method="post" className="space-y-2">
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <textarea
                    name="summary"
                    defaultValue={booking.sessionRecords[0]?.summary || ""}
                    placeholder="Session summary"
                    className="w-full border rounded p-2 min-h-24"
                  />
                  <textarea
                    name="privateNotes"
                    defaultValue={booking.sessionRecords[0]?.privateNotes || ""}
                    placeholder="Private notes"
                    className="w-full border rounded p-2 min-h-24"
                  />
                  <input
                    name="qualityRating"
                    type="number"
                    min={1}
                    max={5}
                    defaultValue={booking.sessionRecords[0]?.qualityRating || ""}
                    className="w-32 border rounded p-2"
                  />
                  <button type="submit" className="bg-primary text-primary-foreground rounded px-4 py-2">
                    Save Record
                  </button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
    </div>
  )
}
