import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, Video, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"

export default async function CounselorDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is a counselor
  if (user.role !== "COUNSELOR") {
    redirect("/dashboard")
  }

  if (user.counselorApprovalStatus !== "APPROVED") {
    redirect("/counselor/pending")
  }

  const counselor = await prisma.counselor.findUnique({
    where: { email: user.email },
    select: { id: true },
  })

  if (!counselor) {
    redirect("/counselor/pending")
  }

  // Get counselor's upcoming and past sessions
  const now = new Date()
  
  const upcomingSessions = await prisma.booking.findMany({
    where: {
      counselorId: counselor.id,
      scheduledAt: {
        gte: now,
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
    },
    orderBy: {
      scheduledAt: "asc",
    },
  })

  const pastSessions = await prisma.booking.findMany({
    where: {
      counselorId: counselor.id,
      scheduledAt: {
        lt: now,
      },
      status: {
        in: ["COMPLETED", "CANCELLED"],
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      scheduledAt: "desc",
    },
    take: 10,
  })

  const todaySessions = upcomingSessions.filter(
    (session) => session.scheduledAt.toDateString() === now.toDateString()
  )

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-sans font-bold text-3xl mb-2">Counselor Dashboard</h1>
          <p className="text-muted-foreground font-sans">
            Welcome back, {user.name}! Manage your sessions and view your schedule.
          </p>
          
          {/* Navigation Links */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <a href="/counselor/sessions">
                <Calendar className="h-4 w-4 mr-2" />
                My Sessions
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/counselor/clients">
                <Users className="h-4 w-4 mr-2" />
                My Clients
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/counselor/schedule">
                <Clock className="h-4 w-4 mr-2" />
                Schedule
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/counselor/notes">
                <CheckCircle className="h-4 w-4 mr-2" />
                Session Notes
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/counselor/profile">
                <Users className="h-4 w-4 mr-2" />
                My Profile
              </a>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-sans">
                Today's Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">{todaySessions.length}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-sans">
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">{upcomingSessions.length}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-sans">
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">
                {upcomingSessions.length + pastSessions.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-sans">
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">
                {pastSessions.length > 0 
                  ? Math.round((pastSessions.filter(s => s.status === "COMPLETED").length / pastSessions.length) * 100)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Sessions */}
        {todaySessions.length > 0 && (
          <Card className="border-2 border-black mb-8">
            <CardHeader>
              <CardTitle className="font-sans font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaySessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-sans font-medium">
                          {session.user.name || session.user.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="font-sans">
                          {format(session.scheduledAt, "h:mm a")} - {format(new Date(session.scheduledAt.getTime() + (session.duration || 60) * 60 * 1000), "h:mm a")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={session.status === "CONFIRMED" ? "default" : "secondary"} className="font-sans">
                        {session.status}
                      </Badge>
                      {session.meetingLink && (
                        <Button size="sm" variant="outline" className="border-2 border-black" asChild>
                          <a href={session.meetingLink} target="_blank" rel="noreferrer">
                          <Video className="h-4 w-4 mr-2" />
                          Join
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Sessions */}
        <Card className="border-2 border-black mb-8">
          <CardHeader>
            <CardTitle className="font-sans font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-sans font-medium">
                          {session.user.name || session.user.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="font-sans">
                          {format(session.scheduledAt, "MMM d, yyyy")}
                        </span>
                        <Clock className="h-4 w-4" />
                        <span className="font-sans">
                          {format(session.scheduledAt, "h:mm a")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={session.status === "CONFIRMED" ? "default" : "secondary"} className="font-sans">
                        {session.status}
                      </Badge>
                      {session.meetingLink && (
                        <Button size="sm" variant="outline" className="border-2 border-black" asChild>
                          <a href={session.meetingLink} target="_blank" rel="noreferrer">
                          <Video className="h-4 w-4 mr-2" />
                          Join
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground font-sans">
                No upcoming sessions scheduled.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Past Sessions */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="font-sans font-bold flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pastSessions.length > 0 ? (
              <div className="space-y-4">
                {pastSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-sans font-medium">
                          {session.user.name || session.user.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="font-sans">
                          {format(session.scheduledAt, "MMM d, yyyy")}
                        </span>
                        <Clock className="h-4 w-4" />
                        <span className="h-4 w-4" />
                        <span className="font-sans">
                          {format(session.scheduledAt, "h:mm a")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={session.status === "COMPLETED" ? "default" : "destructive"} 
                        className="font-sans"
                      >
                        {session.status === "COMPLETED" ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {session.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground font-sans">
                No past sessions to display.
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  )
}
