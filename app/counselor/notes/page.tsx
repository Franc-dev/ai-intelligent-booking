import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { User, Calendar, Clock, FileText, Plus, Search, Edit, Eye, Trash2 } from "lucide-react"
import { format } from "date-fns"

export default async function CounselorNotesPage() {
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

  // Get counselor's sessions with notes
  const sessions = await prisma.booking.findMany({
    where: {
      counselorId: counselor.id,
      status: { in: ["COMPLETED", "CONFIRMED"] }
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
      scheduledAt: 'desc'
    }
  })

  const completedSessions = sessions.filter(s => s.status === "COMPLETED")
  const upcomingSessions = sessions.filter(s => s.status === "CONFIRMED" && new Date(s.scheduledAt) > new Date())

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session Notes</h1>
          <p className="text-gray-600 mt-2">Manage your session notes and client records</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">
              All time sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready for notes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notes Written</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedSessions.filter(s => s.notes && s.notes.length > 20).length}
            </div>
            <p className="text-xs text-muted-foreground">
              With detailed notes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search notes by client name or content..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter by Date</Button>
            <Button variant="outline">Filter by Client</Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions for Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Sessions - Add Notes
          </CardTitle>
          <CardDescription>
            Sessions that need notes or can be updated
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No sessions found</p>
              <p className="text-sm">Sessions will appear here after they're completed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.slice(0, 10).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {session.user.name || session.user.email}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(session.scheduledAt), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(session.scheduledAt), 'h:mm a')}
                        </div>
                        <Badge variant={session.status === "COMPLETED" ? "default" : "secondary"}>
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {session.status === "COMPLETED" ? (
                      <>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Notes
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Notes
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Prepare Notes
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample Note Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Session Note Template
          </CardTitle>
          <CardDescription>
            Use this template for consistent note-taking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Client Name</label>
                <Input placeholder="Client's full name" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Session Date</label>
                <Input type="date" className="mt-1" />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Session Duration</label>
              <Input placeholder="e.g., 60 minutes" className="mt-1" />
            </div>
            
            <div>
              <label className="text-sm font-medium">Presenting Issues</label>
              <Textarea 
                placeholder="What brought the client to therapy today? What are their main concerns?"
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Session Summary</label>
              <Textarea 
                placeholder="Key topics discussed, interventions used, client's response..."
                className="mt-1"
                rows={4}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Progress Notes</label>
              <Textarea 
                placeholder="Client's progress, changes observed, goals achieved..."
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Homework/Next Steps</label>
              <Textarea 
                placeholder="Assignments given to client, follow-up actions, next session focus..."
                className="mt-1"
                rows={2}
              />
            </div>
            
            <div className="flex gap-2">
              <Button>Save Note</Button>
              <Button variant="outline">Save as Template</Button>
              <Button variant="outline">Clear Form</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Export Notes</CardTitle>
            <CardDescription>Download all session notes</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Note Templates</CardTitle>
            <CardDescription>Manage your note templates</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Manage Templates
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Client Reports</CardTitle>
            <CardDescription>Generate client progress reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
