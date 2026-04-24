import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Video, FileText, Plus, Settings } from "lucide-react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays } from "date-fns"

export default async function CounselorSchedulePage() {
  const user = await getCurrentUser()
  
  if (!user || user.role !== "COUNSELOR") {
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

  // Get current week's sessions
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday start
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  
  const weekSessions = await prisma.booking.findMany({
    where: {
      counselorId: counselor.id,
      scheduledAt: {
        gte: weekStart,
        lte: weekEnd
      },
      status: { in: ["CONFIRMED", "COMPLETED", "CANCELLED"] }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      scheduledAt: 'asc'
    }
  })

  // Get today's sessions
  const todaySessions = weekSessions.filter(session => 
    isSameDay(new Date(session.scheduledAt), now)
  )

  // Get upcoming sessions (next 7 days)
  const upcomingSessions = weekSessions.filter(session => 
    new Date(session.scheduledAt) > now
  )

  // Generate week view
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Confirmed</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSessionsForDay = (date: Date) => {
    return weekSessions.filter(session => 
      isSameDay(new Date(session.scheduledAt), date)
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-600 mt-2">View and manage your counseling schedule</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Availability
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Block Time
          </Button>
        </div>
      </div>

      {/* Today's Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Schedule - {format(now, 'EEEE, MMMM dd, yyyy')}
          </CardTitle>
          <CardDescription>
            Your sessions for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todaySessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No sessions scheduled for today</p>
              <p className="text-sm">Enjoy your free time or block it for preparation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todaySessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(session.status)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {format(new Date(session.scheduledAt), 'h:mm a')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {session.user.name || session.user.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {session.status === "CONFIRMED" && (
                      <>
                        <Button variant="outline" size="sm">
                          <Video className="h-4 w-4 mr-2" />
                          Join Session
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Notes
                        </Button>
                      </>
                    )}
                    {session.status === "COMPLETED" && (
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Notes
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Week View - {format(weekStart, 'MMM dd')} to {format(weekEnd, 'MMM dd, yyyy')}
          </CardTitle>
          <CardDescription>
            Your schedule for the current week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const daySessions = getSessionsForDay(day)
              const isToday = isSameDay(day, now)
              
              return (
                <div key={day.toISOString()} className={`min-h-[200px] p-3 border rounded-lg ${
                  isToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                }`}>
                  <div className={`text-center mb-3 ${
                    isToday ? 'font-bold text-blue-600' : 'font-medium'
                  }`}>
                    <div className="text-sm text-gray-500">
                      {format(day, 'EEE')}
                    </div>
                    <div className="text-lg">
                      {format(day, 'd')}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {daySessions.map((session) => (
                      <div key={session.id} className="p-2 bg-white rounded border text-xs">
                        <div className="font-medium text-gray-900 truncate">
                          {session.user.name || session.user.email}
                        </div>
                        <div className="text-gray-600">
                          {format(new Date(session.scheduledAt), 'h:mm a')}
                        </div>
                        <div className="mt-1">
                          {getStatusBadge(session.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Sessions
          </CardTitle>
          <CardDescription>
            Your confirmed sessions for the next few days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No upcoming sessions</p>
              <p className="text-sm">New bookings will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.slice(0, 10).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(session.status)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {format(new Date(session.scheduledAt), 'EEEE, MMM dd')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {format(new Date(session.scheduledAt), 'h:mm a')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {session.user.name || session.user.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4 mr-2" />
                      Join
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Notes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Block Time</CardTitle>
            <CardDescription>Mark time as unavailable</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Block Time Slot
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Set Availability</CardTitle>
            <CardDescription>Configure your working hours</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Manage Hours
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Export Schedule</CardTitle>
            <CardDescription>Download your schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Export Calendar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
