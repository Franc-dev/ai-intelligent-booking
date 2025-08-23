"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader, TableLoader } from "@/components/ui/loader"
import { Calendar, Clock, Users, Activity } from "lucide-react"
import { format } from "date-fns"

interface MeetingLinkStatus {
  link: string
  id: string
  isAvailable: boolean
  nextAvailable: Date | null
  currentBooking?: {
    id: string
    scheduledAt: Date
    user: { name: string | null; email: string }
    counselor: { name: string }
  }
}

export function MeetingLinksDashboard() {
  const [meetingLinks, setMeetingLinks] = useState<MeetingLinkStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    inUse: 0,
    utilization: 0,
  })

  useEffect(() => {
    fetchMeetingLinksStatus()
  }, [])

  const fetchMeetingLinksStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/meeting-links/status")
      if (response.ok) {
        const data = await response.json()
        setMeetingLinks(data.meetingLinks)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch meeting links status:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchMeetingLinksStatus()
  }

  if (loading) {
    return <TableLoader />
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-black shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-sans font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Total Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-sans font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-sans font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-sans font-bold text-green-600">{stats.available}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-sans font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              In Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-sans font-bold text-blue-600">{stats.inUse}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-sans font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-sans font-bold text-purple-600">{stats.utilization}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Meeting Links Table */}
      <Card className="border-2 border-black shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-sans font-bold">Meeting Room Status</CardTitle>
            <Button onClick={refreshData} variant="outline" size="sm" className="border-2 border-black shadow-sm font-sans">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {meetingLinks.map((link) => (
              <div key={link.id} className="border-2 border-black p-4 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={link.isAvailable ? "default" : "secondary"} className="text-xs">
                        {link.isAvailable ? "Available" : "In Use"}
                      </Badge>
                      <span className="font-sans font-medium text-sm">Room {link.id}</span>
                    </div>

                    <div className="text-sm text-muted-foreground font-mono">
                      {link.link}
                    </div>
                  </div>

                  <div className="text-right">
                    {link.isAvailable ? (
                      <div className="text-green-600 text-sm font-sans">
                        Ready for booking
                      </div>
                    ) : (
                      <div className="text-blue-600 text-sm font-sans">
                        Next available: {link.nextAvailable ? format(link.nextAvailable, "MMM d, h:mm a") : "Unknown"}
                      </div>
                    )}
                  </div>
                </div>

                {link.currentBooking && (
                  <div className="bg-muted/50 p-3 border border-border rounded">
                    <div className="text-sm font-sans font-medium mb-2">Current Session:</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">User:</span> {link.currentBooking.user.name || link.currentBooking.user.email}
                      </div>
                      <div>
                        <span className="font-medium">Counselor:</span> {link.currentBooking.counselor.name}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span> {format(link.currentBooking.scheduledAt, "h:mm a")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card className="border-2 border-black shadow-sm">
        <CardHeader>
          <CardTitle className="font-sans font-bold">System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <p>• Meeting rooms are automatically assigned based on availability</p>
            <p>• Each room supports 1-hour counseling sessions</p>
            <p>• Rooms are released automatically after session completion</p>
            <p>• Fallback rooms are generated if all primary rooms are occupied</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

