import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Mail, Calendar, Clock, MessageSquare, Phone, MapPin, Search } from "lucide-react"
import { format } from "date-fns"

export default async function CounselorClientsPage() {
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

  // Get counselor's clients (users who have booked sessions)
  const clients = await prisma.booking.findMany({
    where: {
      counselorId: counselor.id,
      status: { in: ["CONFIRMED", "COMPLETED"] }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      }
    },
    orderBy: {
      scheduledAt: 'desc'
    }
  })

  // Get unique clients and their session counts
  const uniqueClients = clients.reduce((acc, booking) => {
    const userId = booking.user.id
    if (!acc[userId]) {
      acc[userId] = {
        ...booking.user,
        totalSessions: 0,
        completedSessions: 0,
        lastSession: null,
        nextSession: null
      }
    }
    
    acc[userId].totalSessions++
    
    if (booking.status === "COMPLETED") {
      acc[userId].completedSessions++
    }
    
    if (!acc[userId].lastSession || new Date(booking.scheduledAt) > new Date(acc[userId].lastSession)) {
      acc[userId].lastSession = booking.scheduledAt
    }
    
    if (booking.status === "CONFIRMED" && new Date(booking.scheduledAt) > new Date()) {
      if (!acc[userId].nextSession || new Date(booking.scheduledAt) < new Date(acc[userId].nextSession)) {
        acc[userId].nextSession = booking.scheduledAt
      }
    }
    
    return acc
  }, {} as Record<string, any>)

  const clientList = Object.values(uniqueClients)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Clients</h1>
          <p className="text-gray-600 mt-2">Manage your client relationships and view client information</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientList.length}</div>
            <p className="text-xs text-muted-foreground">
              Active clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              All time sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter(c => c.status === "COMPLETED").length}
            </div>
            <p className="text-xs text-muted-foreground">
              This month: {clients.filter(c => 
                c.status === "COMPLETED" && 
                new Date(c.scheduledAt).getMonth() === new Date().getMonth()
              ).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter(c => c.status === "CONFIRMED" && new Date(c.scheduledAt) > new Date()).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Upcoming sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search clients by name or email..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Client Directory
          </CardTitle>
          <CardDescription>
            View and manage your client relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No clients yet</p>
              <p className="text-sm">Clients will appear here after booking sessions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clientList.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {client.name || 'Anonymous Client'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Client since {format(new Date(client.createdAt), 'MMM yyyy')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="text-center">
                      <div className="font-medium">{client.totalSessions}</div>
                      <div className="text-xs">Total Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{client.completedSessions}</div>
                      <div className="text-xs">Completed</div>
                    </div>
                    {client.nextSession && (
                      <div className="text-center">
                        <div className="font-medium text-blue-600">
                          {format(new Date(client.nextSession), 'MMM dd')}
                        </div>
                        <div className="text-xs">Next Session</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Client Activity
          </CardTitle>
          <CardDescription>
            Latest sessions and interactions with your clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clients.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">
                        Session with {booking.user.name || booking.user.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(booking.scheduledAt), 'MMM dd, yyyy at h:mm a')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={booking.status === "COMPLETED" ? "default" : "secondary"}>
                      {booking.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
